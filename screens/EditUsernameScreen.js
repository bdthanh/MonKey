import React, {useState} from 'react'
import { Text, View, Alert, StyleSheet, TouchableOpacity, TextInput, Pressable, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getUserID } from '../utils/authentication';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../utils/db';
import { StatusBarHeight } from '../components/constants';
import { colors } from '../components/colors';
import { ShadowBox } from 'react-native-neomorph-shadows';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
const { darkBlue, darkYellow } = colors


const EditUsernameScreen = ({navigation}) => {
  const [userName, setUsername] = useState(""); // need to store on Firestore
  const [userId, setUserId] = useState(getUserID())
  
  // get monthlimit and daylimit
  const getUsername = async () => {
    try {
      const userRef = doc(db, "Users", userId);
      const user = await getDoc(userRef)
      setUsername(user.data().username)
    } catch {
      (error) => console.log(error.message)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      getUsername()
      return () => {}
    }, [])
  );

  const onSubmit = async () => {
    if (userName == '') {
      Alert.alert("Alert", "Please enter your new username", [
        {text: 'Okay', onPress: () => console.log('Alert closed')}
      ]);
    } else {
      const usernameRef = doc(db, "Users", getUserID())
      updateDoc(usernameRef, {
        username: userName
      })
      .then(navigation.goBack())
    }
  }

  return (
    <View style={{backgroundColor:'#fff', flex:1}}>
      <StatusBar style='dark'/>
      {/*********** Header ***********/}
      <Pressable onPress={Keyboard.dismiss} style={{flex:1}}>
        <View style={styles.header}>
          <View style={{flex:1, paddingLeft:5, paddingBottom:7}}>
            <TouchableOpacity onPress={()=>navigation.goBack()}>
              <MaterialCommunityIcons name='chevron-left' size={44} color={darkBlue}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:8,alignItems:'center',justifyContent:'center'}}>
            <Text style={styles.boldBlueHeaderText}>Change username</Text>
          </View>
          <View style={{flex:1}}></View>
        </View>

        
        {/*********** Month limit ***********/}
        <View style={[styles.noteView,{paddingTop:8}]}>
          <View style={{
            flex:25,
            paddingLeft:12,
            justifyContent:'center'
            }}>
            <Text style={styles.dateText}>Username</Text>
          </View>
          <View style={{
            flex:80,
            alignItems:'center',
            justifyContent:'center',
          }}>
            <ShadowBox
              inner // <- enable inner shadow
              useSvg // <- set this prop to use svg on ios
              style={{
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.6,
                shadowColor: '#999',
                shadowRadius: 3,
                borderRadius: 10,
                backgroundColor:'#f1fbfd',
                width:235,
                height:36,
              }}
            >
              <TextInput
                maxLength={15}
                style={[styles.noteInputContainer, {textAlign:'left'}]}
                placeholder='Enter username (max 15)'
                placeholderTextColor={'#49494950'}
                value={userName}
                onChangeText={(value) => setUsername(value)}
              />
            </ShadowBox>
          </View>
        </View>
        {/*********** Submit button ***********/}
        <View style={[styles.submitButtonView, {alignItems:'center', justifyContent:'center', }]}>
          <TouchableOpacity 
          style={[styles.inputButton, {borderRadius:10, backgroundColor:darkYellow,width:120}]} 
          onPress={() => {onSubmit()}}> 
            <Text style={styles.cancelText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems:'flex-end', 
    justifyContent:'center',
    flexDirection:'row',
    backgroundColor:'#fff',
    borderBottomColor:'#808080',
    borderBottomWidth:1,
    height: StatusBarHeight + 42,
  },
  boldBlueHeaderText: {
    fontSize: 34,
    color: darkBlue,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  noteView: {
    flexDirection:'row',
    marginBottom: 6,
    paddingBottom:4,
    paddingTop:4,
    paddingLeft:4,
    borderBottomColor: '#E9E9E9',
    borderTopColor: '#E9E9E9',  
    borderTopWidth:1,      
    //borderBottomWidth:1,    
    height:60 
  },
  dateText: {
    fontSize: 19,
    fontWeight: '600',
    color: darkBlue,
  },
  noteInputContainer: {
    color:darkBlue,
    paddingVertical:3,
    paddingHorizontal:7,
    width:240,
    borderRadius: 10,
    fontSize: 17,
    fontWeight:'400',
    height: 36,
  },
  inputContainer: {
    backgroundColor: '#FDEE87',
    color: darkBlue,
    borderColor: darkBlue,
    paddingRight: 12,
    width:200,
    borderRadius: 10,
    fontSize: 20,
    fontWeight:'600',
    height: 36,
  },
  submitButtonView: {
    alignItems:'center',
    justifyContent:'center',
    paddingBottom:4,
    paddingTop:4,
    paddingLeft:4,
    borderBottomColor: '#E9E9E9',
    borderTopColor: '#E9E9E9',     
    height:48,
    paddingTop:20
  },
  inputButton: {
    padding: 5,
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:10,
    backgroundColor:darkYellow,
    width:120
  },
  cancelText: {
    fontSize:18,
    color:'#fff',
    fontWeight:'500',
  },
})

export default EditUsernameScreen;