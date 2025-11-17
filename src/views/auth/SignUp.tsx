import AuthInputField from '@components/form/AuthInputField';
import Form from '@components/form';
import { Formik, FormikHelpers, useFormikContext } from 'formik';
import { FC, useState } from 'react';
import { TextInput, View, Text, StyleSheet, Button, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';
import SubmitBtn from '@components/form/SubmitBtn';
import PasswordVisibilityIcon from '@ui/PasswordVisibilityIcon';
import AppLink from '@ui/AppLink';
import AuthFormContainer from '@components/AuthFormContainer';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from 'src/@types/navigation';
import client from 'src/api/client';

const signUpSchema = yup.object({
  name: yup
    .string()
    .trim('Name is Missing')
    .min(3, 'Invalid Name!')
    .required('Name is Required'),
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

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

const initialValues = {
  name: '',
  email: '',
  password: '',
};
const SignUp: FC<Props> = props => {
  const [secureEntry, setSecureEntry] = useState(true);

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const togglePasswordView = () => {
    setSecureEntry(!secureEntry);
  };

  const handleSubmit = async (
    values: NewUser,
    actions: FormikHelpers<NewUser>,
  ) => {
    actions.setSubmitting(true);

    try {
      // console.log('Submitting values:', values);
      // i want to send this information to out API
      const { data } = await client.post('auth/create', { ...values });
      navigation.navigate('Verification', { userInfo: data.user });
      // console.log(data);
    } catch (error: any) {
      if (error.response) {
        console.log('❌ Server Error:', error.response.data);
        console.log('Status:', error.response.status);
      } else {
        console.log('❌ Network/Other Error Sign Up:', error.message);
      }
    }
    actions.setSubmitting(false);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={signUpSchema}
    >
      <AuthFormContainer
        heading="Welcome"
        subHeading="let's get started by creating your Account!"
      >
        <View style={styles.formContainer}>
          <AuthInputField
            name="name"
            placeholder="John Doe"
            label="Name"
            containerStyle={styles.marginBottom}
          />
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
          <SubmitBtn title="Sign Up" />
          <View style={styles.linkContainer}>
            <AppLink
              title="i lost my password"
              onPress={() => {
                navigation.navigate('LostPassword');
              }}
            />
            <AppLink
              title="Sign In"
              onPress={() => {
                navigation.navigate('SignIn');
              }}
            />
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

export default SignUp;
