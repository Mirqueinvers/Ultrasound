export interface MedisonMeasurement {
  value: number;
  unit: string;
}

export interface MedisonLiverData {
  length: MedisonMeasurement;
  width: MedisonMeasurement;
}

export interface MedisonGallbladderData {
  length: MedisonMeasurement;
  width: MedisonMeasurement;
  wallThickness: MedisonMeasurement;
  commonBileDuct: MedisonMeasurement;
}

export interface MedisonPancreasData {
  head: MedisonMeasurement;
  body: MedisonMeasurement;
  tail: MedisonMeasurement;
}

export interface MedisonSpleenData {
  length: MedisonMeasurement;
  width: MedisonMeasurement;
}

export interface MedisonKidneySideData {
  length: MedisonMeasurement;
  width: MedisonMeasurement;
  parenchymaSize: MedisonMeasurement;
}

export interface MedisonKidneyData {
  left: MedisonKidneySideData;
  right: MedisonKidneySideData;
}

export interface MedisonPortalVeinData {
  diameter: MedisonMeasurement;
}

export interface MedisonObpData {
  liver?: MedisonLiverData;
  gallbladder?: MedisonGallbladderData;
  pancreas?: MedisonPancreasData;
  spleen?: MedisonSpleenData;
  portalVein?: MedisonPortalVeinData;
}

export interface MedisonUterusData {
  length: MedisonMeasurement;
  height: MedisonMeasurement;
  width: MedisonMeasurement;
  volume: MedisonMeasurement;
  endometriumThickness: MedisonMeasurement;
  cervixWidth: MedisonMeasurement;
}

export interface MedisonOvaryData {
  length: MedisonMeasurement;
  width: MedisonMeasurement;
}

export interface MedisonGynData {
  uterus?: MedisonUterusData;
  rightOvary?: MedisonOvaryData;
  leftOvary?: MedisonOvaryData;
}

export interface MedisonBladderData {
  length: MedisonMeasurement;
  height: MedisonMeasurement;
  width: MedisonMeasurement;
  volume: MedisonMeasurement;
  residualLength: MedisonMeasurement;
  residualHeight: MedisonMeasurement;
  residualWidth: MedisonMeasurement;
  residualVolume: MedisonMeasurement;
}

export interface MedisonUroData {
  bladder?: MedisonBladderData;
}

export interface MedisonParsedData {
  patient: {
    fullName: string;
    lastName: string;
    firstName: string;
    middleName: string;
    dateOfBirth: string; // YYYY-MM-DD
  };
  examDate: string; // DD-MM-YYYY
  examTime: string;
  examId: string;
  diagnostician: string;
  obp?: MedisonObpData;
  kidneys?: MedisonKidneyData;
  gyn?: MedisonGynData;
  uro?: MedisonUroData;
}
