export type SafeImagePickerAsset = {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  };


export type Product = {
  product_id: string;
  name: string;
  brand: string;
  price: number;
  ingredients: string[]; // assuming parsed JSON
  description: string;
  stars: number;
  num_reviews: number;
  limpiar: boolean;
  tratar: boolean;
  proteger: boolean;
  image_base64: string | null;
};


export type RecommendedProduct = {
  step: string; // e.g. "cleansers", "moisturizers", etc.
  name: string;
  ingredients: string[];
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
  
    // FR_efficient_net: { _user_id: string };
    FR_efficient_net: undefined;
  
    FR_cnn: {
      frontImage: SafeImagePickerAsset;
      skin_conditions: string[];
      // _user_id: string;
    };
  };