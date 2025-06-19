export type SafeImagePickerAsset = {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  };

export type Product = {
  id: number;
  title: string;
  description: string;
  image: SafeImagePickerAsset;
  step: string;
};
  
  
  export type RootStackParamList = {
    Intro: undefined;
    Register: undefined;
    Login: undefined;
    ProductDetail: { product: Product };
  
    AnalysisResults: {
      results: {
        cnn: {
          skinType: string;
          confidence: number;
          // imageUri: string;
          inputImage: SafeImagePickerAsset;
        };
        eff: {
          conditions: string[];
          // confidence: number;
          // imageUri: string;
          inputImage: SafeImagePickerAsset;
        };
      };
      sensitive: boolean; // ✅ added this line
      // _user_id: string;
    };
  
    SkinSensitive: {
      results: {
        cnn: {
          skinType: string;
          confidence: number;
          // imageUri: string;
          inputImage: SafeImagePickerAsset;
        };
        eff: {
          conditions: string[];
          // confidence: number;
          // imageUri: string;
          inputImage: SafeImagePickerAsset;
        };
      };
    };
  
    FR_efficient_net: { _user_id: string };
  
    FR_cnn: {
      frontImage: SafeImagePickerAsset;
      skin_conditions: string[];
      _user_id: string;
    };
  };