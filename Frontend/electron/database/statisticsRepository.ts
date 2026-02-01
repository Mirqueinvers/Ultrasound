import type Database from "better-sqlite3";

export interface StatisticsData {
  totalPatients: number;
  totalResearches: number;
  totalStudies: number;
  researchesInPeriod: number;
  patientsInPeriod: number;
  studiesInPeriod: number;
  paymentStats: {
    oms: number;
    paid: number;
  };
  studiesByType: { [key: string]: number };
  monthlyResearches: { month: string; count: number }[];
  recentActivity: {
    date: string;
    patientName: string;
    studyType: string;
  }[];
  doctorsStats: {
    doctorName: string;
    patientCount: number;
    researchCount: number;
  }[];
}

export class StatisticsRepository {
  constructor(private db: Database.Database) {}

  getStatistics(startDate?: string, endDate?: string): StatisticsData {
    try {
      const totalPatients = this.getTotalPatients();
      const totalResearches = this.getTotalResearches();
      const totalStudies = this.getTotalStudies();
      
      // Если период не задан, показываем все данные
      const hasPeriod = startDate && endDate;
      
      const researchesInPeriod = this.getResearchesInPeriod(startDate, endDate);
      const patientsInPeriod = this.getPatientsInPeriod(startDate, endDate);
      const studiesInPeriod = this.getStudiesInPeriod(startDate, endDate);
      const paymentStats = this.getPaymentStats(startDate, endDate);
      const studiesByType = this.getStudiesByType(startDate, endDate);
      const monthlyResearches = this.getMonthlyResearches();
      const recentActivity = this.getRecentActivity(startDate, endDate);
      const doctorsStats = this.getDoctorsStats(startDate, endDate);

      return {
        totalPatients,
        totalResearches,
        totalStudies,
        researchesInPeriod,
        patientsInPeriod,
        studiesInPeriod,
        paymentStats,
        studiesByType,
        monthlyResearches,
        recentActivity,
        doctorsStats,
      };
    } catch (error) {
      console.error("Error getting statistics:", error);
      throw new Error("Ошибка при получении статистики");
    }
  }

  getCurrentMonthRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    };
  }

  private getTotalPatients(): number {
    const row = this.db
      .prepare("SELECT COUNT(*) as count FROM patients")
      .get() as { count: number };
    return row.count;
  }

  private getTotalResearches(): number {
    const row = this.db
      .prepare("SELECT COUNT(*) as count FROM researches")
      .get() as { count: number };
    return row.count;
  }

  private getTotalStudies(): number {
    const row = this.db
      .prepare("SELECT COUNT(*) as count FROM research_studies")
      .get() as { count: number };
    return row.count;
  }

  private getResearchesInPeriod(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) {
      return 0;
    }
    
    const row = this.db
      .prepare("SELECT COUNT(*) as count FROM researches WHERE research_date BETWEEN ? AND ?")
      .get(startDate, endDate) as { count: number };
    return row.count;
  }

  private getPatientsInPeriod(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) {
      return 0;
    }
    
    const row = this.db
      .prepare("SELECT COUNT(DISTINCT patient_id) as count FROM researches WHERE research_date BETWEEN ? AND ?")
      .get(startDate, endDate) as { count: number };
    return row.count;
  }

  private getStudiesInPeriod(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) {
      return 0;
    }
    
    const row = this.db
      .prepare(`
        SELECT COUNT(*) as count 
        FROM research_studies rs
        JOIN researches r ON rs.research_id = r.id
        WHERE r.research_date BETWEEN ? AND ?
      `)
      .get(startDate, endDate) as { count: number };
    return row.count;
  }

  private getPaymentStats(startDate?: string, endDate?: string): { oms: number; paid: number } {
    let query = "SELECT COUNT(*) as count FROM researches WHERE payment_type = ?";
    const params: any[] = ['oms'];
    
    if (startDate && endDate) {
      query += " AND research_date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }
    
    const omsRow = this.db
      .prepare(query)
      .get(...params) as { count: number };
    
    // Для платных исследований
    const paidParams = ['paid'];
    if (startDate && endDate) {
      paidParams.push(startDate, endDate);
    }
    
    const paidRow = this.db
      .prepare(query)
      .get(...paidParams) as { count: number };

    return {
      oms: omsRow?.count || 0,
      paid: paidRow?.count || 0,
    };
  }

  private getStudiesByType(startDate?: string, endDate?: string): { [key: string]: number } {
    let query = `
      SELECT rs.study_type, COUNT(*) as count 
      FROM research_studies rs
      JOIN researches r ON rs.research_id = r.id
    `;
    
    const params: any[] = [];
    
    if (startDate && endDate) {
      query += ` WHERE r.research_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += ` GROUP BY rs.study_type`;

    const rows = this.db
      .prepare(query)
      .all(...params) as { study_type: string; count: number }[];

    const result: { [key: string]: number } = {};
    rows.forEach(row => {
      result[row.study_type] = row.count;
    });

    return result;
  }

  private getMonthlyResearches(): { month: string; count: number }[] {
    const rows = this.db
      .prepare(`
        SELECT 
          strftime('%Y-%m', research_date) as month,
          COUNT(*) as count
        FROM researches 
        GROUP BY strftime('%Y-%m', research_date)
        ORDER BY month DESC
        LIMIT 12
      `)
      .all() as { month: string; count: number }[];

    return rows.map(row => ({
      month: this.formatMonth(row.month),
      count: row.count,
    }));
  }

  private getRecentActivity(startDate?: string, endDate?: string): {
    date: string;
    patientName: string;
    studyType: string;
  }[] {
    let query = `
      SELECT 
        r.research_date as date,
        p.last_name,
        p.first_name,
        p.middle_name,
        rs.study_type
      FROM researches r
      JOIN patients p ON r.patient_id = p.id
      JOIN research_studies rs ON r.id = rs.research_id
    `;
    
    const params: any[] = [];
    
    if (startDate && endDate) {
      query += ` WHERE r.research_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += ` ORDER BY r.research_date DESC, rs.created_at DESC LIMIT 20`;

    const rows = this.db
      .prepare(query)
      .all(...params) as {
        date: string;
        last_name: string;
        first_name: string;
        middle_name: string | null;
        study_type: string;
      }[];

    return rows.map(row => ({
      date: row.date,
      patientName: `${row.last_name} ${row.first_name} ${row.middle_name || ""}`.trim(),
      studyType: this.formatStudyType(row.study_type),
    }));
  }

  private getDoctorsStats(startDate?: string, endDate?: string): {
    doctorName: string;
    patientCount: number;
    researchCount: number;
  }[] {
    let query = `
      SELECT 
        r.doctor_name,
        COUNT(DISTINCT r.patient_id) as patient_count,
        COUNT(r.id) as research_count
      FROM researches r
    `;
    
    const params: any[] = [];
    
    if (startDate && endDate) {
      query += ` WHERE r.research_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += `
      GROUP BY r.doctor_name
      ORDER BY research_count DESC
    `;

    const rows = this.db
      .prepare(query)
      .all(...params) as {
        doctor_name: string;
        patient_count: number;
        research_count: number;
      }[];

    return rows.map(row => ({
      doctorName: row.doctor_name || "Не указан",
      patientCount: row.patient_count,
      researchCount: row.research_count,
    }));
  }

  private formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
  }

  private formatStudyType(studyType: string): string {
    // Преобразуем study_type в читаемый вид
    return studyType
      .replace(/([A-Z])/g, ' $1') // добавляем пробел перед заглавными буквами
      .replace(/^./, str => str.toUpperCase()) // первую букву делаем заглавной
      .trim();
  }
}