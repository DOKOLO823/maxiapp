import AuthInputField from '@components/form/AuthInputField';
import Form from '@components/form';
import { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import * as yup from 'yup';
import SubmitBtn from '@components/form/SubmitBtn';
import AppLink from '@ui/AppLink';
import AuthFormContainer from '@components/AuthFormContainer';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from 'src/@types/navigation';
import { FormikHelpers } from 'formik';
import client from 'src/api/client';

const lostPasswordSchema = yup.object({
  email: yup
    .string()
    .trim('Email is Missing')
    .email('Invalid Email!')
    .required('Email is Required'),
});
interface Props {}

interface InitailValue {
  email: string;
}
const initialValues = {
  email: '',
};

  const handleSubmit = async (
    values: InitailValue,
    actions: FormikHelpers<InitailValue>,
  ) => {
    actions.setSubmitting(true);

    try {
      // console.log('Submitting values:', values);
      // i want to send this information to out API
      const { data } = await client.post('auth/forget-password', { ...values });
      console.log(data);
    } catch (error: any) {
      if (error.response) {
        console.log('❌ Server Error:', error.response.data);
        console.log('Status:', error.response.status);
      } else {
        console.log('❌ Network/Other Error forget-password:', error.message);
      }
    }
    actions.setSubmitting(false);
  };

const LostPassword: FC<Props> = props => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={lostPasswordSchema}
    >
      <AuthFormContainer
        heading="Forget Password!"
        subHeading="Enter Your Email to recover your password "
      >
        <View style={styles.formContainer}>
          <AuthInputField
            name="email"
            placeholder="john@email.com"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.marginBottom}
          />

          <SubmitBtn title="Send Link" />
          <View style={styles.linkContainer}>
            <AppLink
              title="Sign In"
              onPress={() => {
                navigation.navigate('SignIn');
              }}
            />
            <AppLink
              title="Sign Up"
              onPress={() => {
                navigation.navigate('SignUp');
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

export default LostPassword;
