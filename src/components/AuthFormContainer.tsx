
import CircleUi from '@ui/CircleUi';
import colors from '@utils/colors';
import { FC, ReactNode } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface Props {
  heading?: string;
  subHeading?: string;
  children: ReactNode;
}

const AuthFormContainer: FC<Props> = ({ children, heading, subHeading }) => {
  return (
    <View style={styles.container}>
      <CircleUi position="top-left" size={200} />
      <CircleUi position="top-right" size={100} />
      <CircleUi position="bottom-left" size={100} />
      <CircleUi position="bottom-right" size={200} />
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/logo1.png')}
          style={styles.imgsize}
        />
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.subHeading}>{subHeading}</Text>
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.PRIMARY,
    paddingTop: 10, // to Account for Safeareaview
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  heading: {
    color: colors.SECONDARY,
    fontSize: 25,
    fontWeight: 'bold',
    paddingVertical: 5,
  },
  subHeading: { color: colors.CONTRAST, fontSize: 16, fontWeight: 'bold' },
  headerContainer: { width: '100%', marginBottom: 20 },
  imgsize: {
    width: 220,
    height: 70,

  },
});

export default AuthFormContainer;
