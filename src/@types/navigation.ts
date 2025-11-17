interface NewUserResponse {
  id?: string;
  name: string;
  email?: string;
}

export type AuthStackParamList = {
  SignUp: undefined;
  SignIn: undefined;
  LostPassword: undefined;
  Verification: { userInfo: NewUserResponse };
};

// Ajout de HomeNavigatorStackParamList
export type HomeNavigatorStackParamList = {
  Home: undefined;
  Profile: undefined;
  PublicProfile: { profileId: string };
};
