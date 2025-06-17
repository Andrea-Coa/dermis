export type RootStackParamList = {
  Intro: undefined;
  Register: undefined;
  //FacialRecognition: {_user_id:string};
  AnalysisResults: {
    results: {
      cnn: {
        skinType: string;
        confidence: number;
        imageUri: string;
      };
      eff: {
        conditions: string[];
        confidence: number;
        imageUri: string;
      };
    };
    _user_id: string;
  }
;
  FR_efficient_net: {_user_id:string};
  FR_cnn: {frontImage: {
      uri: string;
      width: number;
      height: number;
      base64?: string;
    };_user_id:string};
};

