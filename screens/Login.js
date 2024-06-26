import React, {useState, useEffect} from 'react'
import MainContainer from '../components/Containers/Main';
import KeyboardAvoidingContainer from '../components/Containers/KeyboardAvoiding';
import { Text, View } from 'react-native';
import styles from '../components/styles';
import TextInputWithIcon from '../components/Containers/TextInputWithIcon';
import LogInButton from '../components/Containers/LogInButton';
import PressableText from '../components/Containers/PressableText';
import { autoNav, handleLogIn } from '../utils/authentication';

const Login = ({navigation}) => {
  useEffect(() => autoNav(navigation), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <MainContainer>
        <KeyboardAvoidingContainer>
          <View 
            style={{alignItems: 'center' }}>
            <Text style={styles.appName}>MonKey</Text>
          </View>
          <View style={{alignContent: 'flex-start', paddingBottom: 20}}>
            <Text style={styles.boldBlueText}>Login</Text>
            {/* <Text style={styles.italicText}>Hello, welcome back to your account!</Text> */}
          </View>
            <TextInputWithIcon
              label='Email address'
              icon='mail'
              placeholder='yourmail@gmail.com'
              keyboardType='email-address'
              value={email}
              autoCapitalize = 'none'
              onChangeText={text => setEmail(text)}
            />
            <TextInputWithIcon
              label='Password'
              icon='lock-open'
              placeholder='* * * * * * * *'
              isPassword={true}
              value={password}
              autoCapitalize = 'none'
              onChangeText={text => setPassword(text)}
            />
            <LogInButton onPress={() => handleLogIn(email, password)}>
              Login
            </LogInButton>
            <PressableText onPress={() => navigation.navigate('SignUp')}>
              New to MonKey? Sign-up here
            </PressableText>
            <PressableText onPress={() => navigation.navigate('ForgotPassword')}>
              Forgot password?
            </PressableText>
        </KeyboardAvoidingContainer>
      </MainContainer>
    </>
  )
}

export default Login;