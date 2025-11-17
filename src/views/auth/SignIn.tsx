import AuthInputField from '@components/form/AuthInputField';
import Form from '@components/form';
import { FC, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as yup from 'yup';
import SubmitBtn from '@components/form/SubmitBtn';
import PasswordVisibilityIcon from '@ui/PasswordVisibilityIcon';
import AppLink from '@ui/AppLink';
import AuthFormContainer from '@components/AuthFormContainer';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from 'src/@types/navigation';
import { FormikHelpers } from 'formik';
import client from 'src/api/client';
import { updateLoggedInState, updateProfile } from 'src/store/auth';
import { useDispatch } from 'react-redux';
import { Keys, saveToAsyncStorage } from '@utils/asyncStorage';

const signInSchema = yup.object({
  email: yup
    .string()
    .trim('Email is Missing')
    .email('Invalid Email!')
    .required('Email is Required'),
  password: yup
    .string()
    .trim('Password is Missing')
    .min(8, ' Password is too short')
    .required('Password is Required'),
});
interface Props {}

interface SignInUserInfos {
  email: string;
  password: string;
}

const initialValues = {
  email: '',
  password: '',
};
const SignIn: FC<Props> = props => {
  const [secureEntry, setSecureEntry] = useState(true);

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const dispatch = useDispatch();

  const togglePasswordView = () => {
    setSecureEntry(!secureEntry);
  };

  const handleSubmit = async (
    values: SignInUserInfos,
    actions: FormikHelpers<SignInUserInfos>,
  ) => {
    actions.setSubmitting(true);

    try {
      // console.log('Submitting values:', values);
      // i want to send this information to out API
      const { data } = await client.post('auth/sign-in', { ...values });
      // console.log(data);
      await saveToAsyncStorage(Keys.AUTH_TOKEN, data.token);
      dispatch(updateProfile(data.profile));
      dispatch(updateLoggedInState(true));
    } catch (error: any) {
      if (error.response) {
        console.log('❌ Server Error:', error.response.data);
        console.log('Status:', error.response.status);
      } else {
        console.log('❌ Network/Other Error sign-in:', error.message);
      }
    }
    actions.setSubmitting(false);
  };
  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={signInSchema}
    >
      <AuthFormContainer heading="Welcome Back!">
        <View style={styles.formContainer}>
          <AuthInputField
            name="email"
            placeholder="john@email.com"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.marginBottom}
          />
          <AuthInputField
            name="password"
            placeholder="*******"
            label="Password"
            autoCapitalize="none"
            secureTextEntry={secureEntry}
            containerStyle={styles.marginBottom}
            rightIcon={<PasswordVisibilityIcon privateIcon={secureEntry} />}
            onRightIconPress={togglePasswordView}
          />
          <SubmitBtn title="Sign In" />
          <View style={styles.linkContainer}>
            <AppLink
              title="i lost my password"
              onPress={() => {
                navigation.navigate('LostPassword');
              }}
            ></AppLink>
            <AppLink
              title="Sign Up"
              onPress={() => {
                navigation.navigate('SignUp');
              }}
            ></AppLink>
          </View>
        </View>
      </AuthFormContainer>
    </Form>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  marginBottom: {
    marginBottom: 20,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default SignIn;
