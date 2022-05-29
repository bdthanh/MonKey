import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput , View, Button, Alert,TouchableWithoutFeedback,KeyboardAvoidingView , Keyboard } from 'react-native';
import React from "react";
import Login from './screens/Login';
import Signup from './screens/Signup';

export default function App() {
  return (
    <>
      <StatusBar style = "light"/>
      <Login></Login>
    </>
  )
}
