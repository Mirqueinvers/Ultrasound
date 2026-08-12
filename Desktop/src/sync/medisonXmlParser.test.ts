import { describe, expect, it } from "vitest";
import { parseMedisonXml } from "./medisonXmlParser";

const fullXml = `<?xml version="1.0" encoding="UTF-8"?>
<Report>
  <ExamTime date="2026-01-15" time="10:30:00"/>
  <Header id="ID"><h value="M12345" unit=""/></Header>
  <Header id="Name"><h value="КУЗНЕЦОВ, ДМИТРИЙ ЮРЬЕВИЧ" unit=""/></Header>
  <Header id="DiagPhys"><h value="Петров П.П." unit=""/></Header>
  <Header id="Birthday"><h value="15-01-1980" unit=""/></Header>
  <Group id="Rad_Liver">
    <measurement id="Rad_Liver_L"><m value="156.50" unit="mm"/></measurement>
    <measurement id="Rad_Liver_W"><m value="120.00" unit="mm"/></measurement>
  </Group>
  <Group id="Rad_Kidney">
    <measurement id="Rad_Kidney_LL"><m value="110.00" unit="mm"/></measurement>
    <measurement id="Rad_Kidney_LW"><m value="50.00" unit="mm"/></measurement>
    <measurement id="Rad_Kidney_LH"><m value="20.00" unit="mm"/></measurement>
    <measurement id="Rad_Kidney_RL"><m value="105.00" unit="mm"/></measurement>
    <measurement id="Rad_Kidney_RW"><m value="48.00" unit="mm"/></measurement>
    <measurement id="Rad_Kidney_RH"><m value="19.00" unit="mm"/></measurement>
  </Group>
  <Package id="Thyroid">
    <Group id="Thyroid_Lobe">
      <measurement id="Thyroid_Lobe_RL"><m value="45.00" unit="mm"/></measurement>
      <measurement id="Thyroid_Lobe_RH"><m value="15.00" unit="mm"/></measurement>
      <measurement id="Thyroid_Lobe_RW"><m value="12.00" unit="mm"/></measurement>
      <measurement id="Thyroid_Lobe_RVol"><m value="3.50" unit="ml"/></measurement>
      <measurement id="Thyroid_Lobe_LL"><m value="44.00" unit="mm"/></measurement>
      <measurement id="Thyroid_Lobe_LH"><m value="14.00" unit="mm"/></measurement>
      <measurement id="Thyroid_Lobe_LW"><m value="11.00" unit="mm"/></measurement>
      <measurement id="Thyroid_Lobe_LVol"><m value="3.20" unit="ml"/></measurement>
      <measurement id="Thyroid_Lobe_Isthmus"><m value="3.00" unit="mm"/></measurement>
    </Group>
    <Group id="Thyroid_Mass1" laterality="0">
      <measurement id="Thyroid_Mass1_L"><m value="10.00" unit="mm"/></measurement>
      <measurement id="Thyroid_Mass1_W"><m value="8.00" unit="mm"/></measurement>
    </Group>
    <Group id="Thyroid_Mass2" laterality="1">
      <measurement id="Thyroid_Mass2_L"><m value="12.00" unit="mm"/></measurement>
      <measurement id="Thyroid_Mass2_W"><m value="9.00" unit="mm"/></measurement>
    </Group>
  </Package>
  <Package id="Uro">
    <Group id="Uro_Bladder">
      <measurement id="Uro_Bladder_Length"><m value="90.00" unit="mm"/></measurement>
      <measurement id="Uro_Bladder_Height"><m value="70.00" unit="mm"/></measurement>
      <measurement id="Uro_Bladder_Width"><m value="60.00" unit="mm"/></measurement>
      <measurement id="Uro_Bladder_Volume"><m value="250.00" unit="ml"/></measurement>
    </Group>
    <Group id="Uro_Prostate">
      <measurement id="Uro_Prostate_Length"><m value="40.00" unit="mm"/></measurement>
      <measurement id="Uro_Prostate_Height"><m value="30.00" unit="mm"/></measurement>
      <measurement id="Uro_Prostate_Width"><m value="35.00" unit="mm"/></measurement>
      <measurement id="Uro_Prostate_Volume"><m value="22.00" unit="ml"/></measurement>
    </Group>
  </Package>
  <Package id="Test">
    <Group id="Test_Vol" laterality="0">
      <measurement id="Test_Vol_L"><m value="40.00" unit="mm"/></measurement>
      <measurement id="Test_Vol_H"><m value="25.00" unit="mm"/></measurement>
      <measurement id="Test_Vol_W"><m value="20.00" unit="mm"/></measurement>
      <measurement id="Test_Vol_Vol"><m value="10.00" unit="ml"/></measurement>
    </Group>
    <Group id="Test_Vol" laterality="1">
      <measurement id="Test_Vol_L"><m value="39.00" unit="mm"/></measurement>
      <measurement id="Test_Vol_H"><m value="24.00" unit="mm"/></measurement>
      <measurement id="Test_Vol_W"><m value="19.00" unit="mm"/></measurement>
      <measurement id="Test_Vol_Vol"><m value="9.50" unit="ml"/></measurement>
    </Group>
  </Package>
  <Package id="Gyn">
    <measurement id="GYN_UTERUS_LENGTH"><m value="50.00" unit="mm"/></measurement>
    <measurement id="GYN_UTERUS_HEIGHT"><m value="40.00" unit="mm"/></measurement>
    <measurement id="GYN_UTERUS_WIDTH"><m value="60.00" unit="mm"/></measurement>
    <measurement id="GYN_RtOvary_LENGTH"><m value="30.00" unit="mm"/></measurement>
    <measurement id="GYN_RtOvary_WIDTH"><m value="20.00" unit="mm"/></measurement>
  </Package>
  <Package id="Breast">
    <Group id="Breast_Mass1" laterality="0">
      <measurement id="Breast_Mass1_L"><m value="15.00" unit="mm"/></measurement>
      <measurement id="Breast_Mass1_D"><m value="10.00" unit="mm"/></measurement>
      <measurement id="Breast_Mass1_W"><m value="20.00" unit="mm"/></measurement>
    </Group>
  </Package>
</Report>`;

describe("parseMedisonXml", () => {
  it("парсит полный XML со всеми исследованиями", () => {
    const result = parseMedisonXml(fullXml);
    expect(result).not.toBeNull();
    if (!result) return;

    // Пациент
    expect(result.patient).toEqual({
      fullName: "КУЗНЕЦОВ, ДМИТРИЙ ЮРЬЕВИЧ",
      lastName: "КУЗНЕЦОВ",
      firstName: "ДМИТРИЙ",
      middleName: "ЮРЬЕВИЧ",
      dateOfBirth: "1980-01-15",
    });
    expect(result.examId).toBe("M12345");
    expect(result.diagnostician).toBe("Петров П.П.");
    expect(result.examDate).toBe("2026-01-15");
    expect(result.examTime).toBe("10:30:00");

    // ОБП
    expect(result.obp?.liver?.length).toEqual({ value: 156.5, unit: "mm" });
    expect(result.obp?.liver?.width).toEqual({ value: 120, unit: "mm" });

    // Почки
    expect(result.kidneys?.left?.length).toEqual({ value: 110, unit: "mm" });
    expect(result.kidneys?.right?.parenchymaSize).toEqual({ value: 19, unit: "mm" });

    // Щитовидка + узлы по сторонам
    expect(result.thyroid?.rightLobe?.volume).toEqual({ value: 3.5, unit: "ml" });
    expect(result.thyroid?.leftMasses).toHaveLength(1);
    expect(result.thyroid?.rightMasses[0]).toEqual({
      length: { value: 10, unit: "mm" },
      width: { value: 8, unit: "mm" },
    });

    // Уро (мочевой пузырь + простата)
    expect(result.uro?.bladder?.volume).toEqual({ value: 250, unit: "ml" });
    expect(result.uro?.prostate?.volume).toEqual({ value: 22, unit: "ml" });

    // Мошонка
    expect(result.testis?.right?.volume).toEqual({ value: 10, unit: "ml" });
    expect(result.testis?.left?.length).toEqual({ value: 39, unit: "mm" });

    // Гинекология
    expect(result.gyn?.uterus?.length).toEqual({ value: 50, unit: "mm" });
    expect(result.gyn?.rightOvary?.length).toEqual({ value: 30, unit: "mm" });

    // Молочные железы
    expect(result.breast?.rightMasses).toHaveLength(1);
    expect(result.breast?.rightMasses[0].height).toEqual({ value: 10, unit: "mm" });
    expect(result.breast?.leftMasses).toHaveLength(0);
  });

  it("возвращает пустой объект для XML без данных (не падает)", () => {
    // Фактическое поведение: парсер не падает, возвращает структуру с пустым пациентом.
    const result = parseMedisonXml("");
    expect(result).not.toBeNull();
    expect(result?.patient.fullName).toBe("");
    expect(result?.kidneys).toBeUndefined();
    expect(result?.obp).toBeUndefined();
  });

  it("обрабатывает XML с пропущенными полями", () => {
    const partial = `<?xml version="1.0"?>
<Report>
  <Header id="Name"><h value="ИВАНОВ, ПЁТР СЕРГЕЕВИЧ" unit=""/></Header>
  <Group id="Rad_Liver">
    <measurement id="Rad_Liver_L"><m value="150.00" unit="mm"/></measurement>
  </Group>
</Report>`;
    const result = parseMedisonXml(partial);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.patient.lastName).toBe("ИВАНОВ");
    expect(result.patient.firstName).toBe("ПЁТР");
    expect(result.obp?.liver?.length).toEqual({ value: 150, unit: "mm" });
    // Отсутствующие измерения подставляются как 0 (не undefined) — фактическое поведение.
    expect(result.obp?.liver?.width).toEqual({ value: 0, unit: "mm" });
    expect(result.kidneys).toBeUndefined();
    expect(result.thyroid).toBeUndefined();
    // Дата рождения не задана — не нормализуется
    expect(result.patient.dateOfBirth).toBe("");
  });

  it("нормализует дату из DD-MM-YYYY в YYYY-MM-DD", () => {
    const xml = `<?xml version="1.0"?>
<Report>
  <Header id="Birthday"><h value="25-12-1990" unit=""/></Header>
</Report>`;
    const result = parseMedisonXml(xml);
    expect(result?.patient.dateOfBirth).toBe("1990-12-25");
  });

  it("пропускает измерения с пустыми значениями", () => {
    const xml = `<?xml version="1.0"?>
<Report>
  <Group id="Rad_Kidney">
    <measurement id="Rad_Kidney_LL"><m value="" unit="mm"/></measurement>
    <measurement id="Rad_Kidney_LW"><m value="50.00" unit="mm"/></measurement>
  </Group>
</Report>`;
    const result = parseMedisonXml(xml);
    // Раз ширина левой почки задана — kidneys присутствует, длина → 0 (заглушка).
    expect(result?.kidneys?.left?.length).toEqual({ value: 0, unit: "mm" });
    expect(result?.kidneys?.left?.width).toEqual({ value: 50, unit: "mm" });
    expect(result?.kidneys?.right).toBeDefined();
  });
});