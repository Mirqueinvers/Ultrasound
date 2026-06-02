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

  getStatistics(startDate?: string, endDate?: string, doctorName?: string): StatisticsData {
    try {
      const totalPatients = this.getTotalPatients();
      const totalResearches = this.getTotalResearches();
      const totalStudies = this.getTotalStudies();
      
      const researchesInPeriod = this.getResearchesInPeriod(startDate, endDate, doctorName);
      const patientsInPeriod = this.getPatientsInPeriod(startDate, endDate, doctorName);
      const studiesInPeriod = this.getStudiesInPeriod(startDate, endDate, doctorName);
      const paymentStats = this.getPaymentStats(startDate, endDate, doctorName);
      const studiesByType = this.getStudiesByType(startDate, endDate, doctorName);
      const monthlyResearches = this.getMonthlyResearches();
      const recentActivity = this.getRecentActivity(startDate, endDate, doctorName);
      const doctorsStats = this.getDoctorsStats(startDate, endDate, doctorName);

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

  /** Добавляет фильтр по врачу и датам к запросу, возвращает { clause, params } */
  private buildWhereClause(startDate?: string, endDate?: string, doctorName?: string): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (startDate && endDate) {
      conditions.push("r.research_date BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    if (doctorName) {
      conditions.push("r.doctor_name = ?");
      params.push(doctorName);
    }

    return {
      clause: conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "",
      params,
    };
  }

  private getResearchesInPeriod(startDate?: string, endDate?: string, doctorName?: string): number {
    if (!startDate || !endDate) {
      return 0;
    }
    
    let query = "SELECT COUNT(*) as count FROM researches r WHERE r.research_date BETWEEN ? AND ?";
    const params: any[] = [startDate, endDate];

    if (doctorName) {
      query += " AND r.doctor_name = ?";
      params.push(doctorName);
    }

    const row = this.db
      .prepare(query)
      .get(...params) as { count: number };
    return row.count;
  }

  private getPatientsInPeriod(startDate?: string, endDate?: string, doctorName?: string): number {
    if (!startDate || !endDate) {
      return 0;
    }
    
    let query = "SELECT COUNT(DISTINCT r.patient_id) as count FROM researches r WHERE r.research_date BETWEEN ? AND ?";
    const params: any[] = [startDate, endDate];

    if (doctorName) {
      query += " AND r.doctor_name = ?";
      params.push(doctorName);
    }

    const row = this.db
      .prepare(query)
      .get(...params) as { count: number };
    return row.count;
  }

  private getStudiesInPeriod(startDate?: string, endDate?: string, doctorName?: string): number {
    if (!startDate || !endDate) {
      return 0;
    }
    
    let query = `
      SELECT COUNT(*) as count 
      FROM research_studies rs
      JOIN researches r ON rs.research_id = r.id
      WHERE r.research_date BETWEEN ? AND ?
    `;
    const params: any[] = [startDate, endDate];

    if (doctorName) {
      query += " AND r.doctor_name = ?";
      params.push(doctorName);
    }

    const row = this.db
      .prepare(query)
      .get(...params) as { count: number };
    return row.count;
  }

  private getPaymentStats(startDate?: string, endDate?: string, doctorName?: string): { oms: number; paid: number } {
    const buildQuery = (paymentType: string): { query: string; params: any[] } => {
      let query = "SELECT COUNT(*) as count FROM researches r WHERE r.payment_type = ?";
      const params: any[] = [paymentType];

      if (startDate && endDate) {
        query += " AND r.research_date BETWEEN ? AND ?";
        params.push(startDate, endDate);
      }

      if (doctorName) {
        query += " AND r.doctor_name = ?";
        params.push(doctorName);
      }

      return { query, params };
    };

    const oms = buildQuery('oms');
    const paid = buildQuery('paid');

    const omsRow = this.db
      .prepare(oms.query)
      .get(...oms.params) as { count: number };

    const paidRow = this.db
      .prepare(paid.query)
      .get(...paid.params) as { count: number };

    return {
      oms: omsRow?.count || 0,
      paid: paidRow?.count || 0,
    };
  }

  private getStudiesByType(startDate?: string, endDate?: string, doctorName?: string): { [key: string]: number } {
    let query = `
      SELECT rs.study_type, COUNT(*) as count 
      FROM research_studies rs
      JOIN researches r ON rs.research_id = r.id
    `;
    
    const { clause, params } = this.buildWhereClause(startDate, endDate, doctorName);
    query += clause;
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
      .all() as { month: string | null; count: number }[];

    return rows
      .filter(row => row.month !== null)
      .map(row => ({
        month: this.formatMonth(row.month!),
        count: row.count,
      }));
  }

  private getRecentActivity(startDate?: string, endDate?: string, doctorName?: string): {
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
    
    const { clause, params } = this.buildWhereClause(startDate, endDate, doctorName);
    query += clause;
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

    return rows
      .filter(row => {
        return /^\d{4}-\d{2}-\d{2}$/.test(row.date);
      })
      .map(row => ({
        date: row.date,
        patientName: `${row.last_name} ${row.first_name} ${row.middle_name || ""}`.trim(),
        studyType: this.formatStudyType(row.study_type),
      }));
  }

  private getDoctorsStats(startDate?: string, endDate?: string, doctorName?: string): {
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
    
    const { clause, params } = this.buildWhereClause(startDate, endDate, doctorName);
    query += clause;
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
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
  }

  private formatStudyType(studyType: string): string {
    return studyType
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}
