import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity,  Modal, TextInput, Alert, Pressable, Keyboard, StyleSheet, FlatList} from 'react-native';
import { colors } from '../components/colors';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, onSnapshot, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../api/db';
import { ScreenWidth } from '../components/constants';
import { getUserID } from '../api/authentication'; 
import { StatusBarHeight } from '../components/constants';
import { MaterialCommunityIcons, Entypo, Foundation } from '@expo/vector-icons'
import { Timestamp } from 'firebase/firestore';
import CurrencyInput from 'react-native-currency-input';
const { lightBlue, darkBlue, darkYellow } = colors

const EditItemScreen = ({route, navigation}) => {
  const [ExpenseCategory, setExpenseCategory] = useState([])
  const [IncomeCategory, setIncomeCategory] = useState([])
  useEffect(() => {
    const expenseCategoryRef = collection(db, 'Input Category/Expense/' + getUserID())
    onSnapshot(expenseCategoryRef, (snapshot) => {
      const expenseCategories = [];
      snapshot.forEach((doc) => {
        if (doc.data().name != 'Edit') {
          expenseCategories.push({
            name: doc.data().name,
            color: doc.data().color,
            icon: doc.data().icon,
          });
        }
      });
      expenseCategories.sort((a, b) => a.name < b.name ? -1 : 1)
      setExpenseCategory(expenseCategories)
    });

    const incomeCategoryRef = collection(db, 'Input Category/Income/' + getUserID())
    onSnapshot(incomeCategoryRef, (snapshot) => {
      const incomeCategories = [];
        snapshot.forEach((doc) => {
          if (doc.data().name != 'Edit') {
            incomeCategories.push({
              name: doc.data().name,
              color: doc.data().color,
              icon: doc.data().icon,
            });
          }
        });

      incomeCategories.sort((a, b) => a.name < b.name ? -1 : 1)
      setIncomeCategory(incomeCategories)
    });}
  , [])
  const [date, setDate] = useState(route.params.inprogressDate)
  const [inprogressAmount, setInprogressAmount] = useState(route.params.inprogressAmount);
  const [inprogressNote, setInprogressNote] = useState(route.params.inprogressNote);
  const [inprogressCategory, setInprogressCategory]= useState(route.params.inprogressCategory);
  let [inprogressDate, setInprogressDate] = useState(moment(route.params.inprogressDate, 'YYYY-MM-DD'));
  const [inprogressId, setInprogressId] = useState(route.params.inprogressId);
  const [inprogressType, setInprogressType] = useState(route.params.inprogressType)
  const [colorC, setColor] = useState(route.params.color)
  const switchType = () => {
    if (inprogressType == 'income') {
      setInprogressType('expense')
      setInprogressCategory('')
    } else {
      setInprogressType('income')
      setInprogressCategory('')
    }
  }
  /********** Date Picker Variables **********/
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    setInprogressDate(moment(selectedDate))
  }

  const addOneDay = () => {
    inprogressDate = setInprogressDate(moment(inprogressDate).add(1, 'day'));
  }

  const subtractOneDay = () => {
    inprogressDate = setInprogressDate(moment(inprogressDate).subtract(1, 'day'));
  }
  
  /*************** Function to edit record ***************/
  const editRow = (id) => {
    const path = 'Finance/' + getUserID() + '/' + date.substring(0, 4)
    const catRef = doc(db, path, id)
    const amountNumber = Number(inprogressAmount)
    if (inprogressDate.format('YYYY-MM-DD') == date) {
      setDoc(catRef, {
        type: inprogressType, 
        date: inprogressDate.format('DD'),
        month: inprogressDate.format('MM'), 
        amount: amountNumber,
        note: inprogressNote,
        category: inprogressCategory,
        notedAt: Timestamp.now(), 
      })
    }
    else {
      deleteDoc(catRef)
      const newpath = 'Finance/' + getUserID() + '/' + inprogressDate.format('YYYY')
      setDoc(doc(db, newpath, id), {
        type: inprogressType, 
        amount: amountNumber,
        date: inprogressDate.format('DD'),
        month: inprogressDate.format('MM'), 
        note: inprogressNote,
        category: inprogressCategory,
        notedAt: Timestamp.now(), 
      })
    }
  }
  const closeEditModal = () => {
    setInprogressCategory('')
    setInprogressNote('')
    setInprogressAmount('')
    setInprogressDate(moment())
    setInprogressId('')  
    setInprogressType('')
    setShow(false)
    navigation.goBack()
    //console.log(inprogressDate.format('DD_MM_YYYY'))
  }
  const onSubmitEdit = () => {
    if (inprogressAmount == null || inprogressAmount == 0) {
      Alert.alert("Alert", "Please enter the amount", [
        {text: 'Understand', onPress: () => console.log('Alert closed')}
      ]);
    }
    else if (inprogressCategory == '') {
      Alert.alert("Alert", "Please choose the category", [
        {text: 'Understand', onPress: () => console.log('Alert closed')}
      ]);
    }
    else if (inprogressAmount != '' && inprogressCategory != '') {
      editRow(inprogressId)
      setInprogressCategory('')
      setInprogressNote('')
      setInprogressAmount('')
      setInprogressDate(moment())
      setInprogressId('')
      setInprogressType('')
      setShow(false)
      navigation.goBack();
    } 
    
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={Keyboard.dismiss}>
        {/*********** Header ***********/}
        <View style={[styles.headerModal, {flexDirection:'row'}]}>
          <View style={{flex:4}}>
            <Text></Text>
          </View>
          <View style={{flex:8, alignItems:'center',justifyContent:'center'}}>
            <Text style={styles.boldBlueHeaderText}>Edit item</Text>
          </View>
          <View style={{flex:4, alignItems:'center', justifyContent:'center', marginBottom:10}}>
            <TouchableOpacity 
              style={{alignItems:'center', justifyContent:'center',backgroundColor:darkYellow,height:30,width:65, borderRadius:5}}
              onPress={closeEditModal}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*********** Type ***********/}
        <View style={styles.noteView}>
          <View style={{
            flex:20,
            paddingLeft:12,
            justifyContent:'center'
            }}>
            <Text style={styles.dateText}>Type</Text>
          </View>
          <View style={{
            flex:80,
            alignItems:'center',
            justifyContent:'center',
            borderBottomColor:darkYellow,
          }}>
            <TouchableOpacity 
              style={{alignItems:'center',justifyContent:'center', backgroundColor:inprogressType=='income' ? '#e2f5e2' : '#fdddcf', width:210, height:34, borderRadius:20}}
              onPress={switchType}>
              <Text style={{color: inprogressType=='income' ? '#26b522' : '#ef5011', fontSize:18, fontWeight:'500'}}>
                {inprogressType=='income' ? 'Income' : 'Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*********** Date ***********/}
        <View style={styles.dateView}>
          <View style={{
            flex:20,
            paddingLeft:12,
            justifyContent:'center'
          }}>
            <Text style={styles.dateText}>Date</Text>
          </View>
          <View style={{
            flex:15,
            alignItems:'center',
            justifyContent:'center'
          }}>
            <TouchableOpacity style={{position: 'absolute'}} onPress={subtractOneDay}>
              <Entypo name='chevron-left' size={28} color={darkBlue}/>
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerView}>
            <TouchableOpacity onPress={()=>setShow(true)}>
              <View>
                <Text style={styles.dateText}>{inprogressDate.format('DD-MM-YYYY')}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{
            flex:15,
            alignItems:'center',
            justifyContent:'center'
          }}>
            <TouchableOpacity style={{position: 'absolute'}} onPress={addOneDay}>
              <Entypo name='chevron-right' size={28} color={darkBlue}/>
            </TouchableOpacity>
          </View>
        </View>
        <Modal 
          visible={show}
          transparent={true}
          animationType='fade'
          style={{backgroundColor:'#fff'}}
        >
          <View style={styles.modalView}>
            <View style={{backgroundColor:'#fff', width:'100%', paddingVertical:15, borderTopRightRadius:20, borderTopLeftRadius:20}}>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', paddingTop:10, paddingLeft:20, paddingRight:20}}>
                <View style={{flex:5}}>
                  <TouchableOpacity onPress={()=> {setShow(false), setInprogressDate(moment())}}>
                    <View>
                      <Text style={styles.datePickerOffText}>Cancel</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{flex:5, alignItems:'flex-end'}}>
                  <TouchableOpacity onPress={()=> setShow(false)}>
                    <View>
                      <Text style={styles.datePickerOffText}>Done</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{
                borderBottomColor: '#E9E9E9',
              }}>
                <DateTimePicker
                  value={new Date(inprogressDate)}
                  is24Hour={true}
                  textColor={darkBlue}
                  display='spinner'
                  onChange ={onChange}
                  minimumDate={new Date(moment().subtract(50, 'years').format('YYYY-MM-DD'))}
                  maximumDate={new Date(moment().add(50, 'years').format('YYYY-MM-DD'))}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/*********** Amount ***********/}
        <View style={styles.dateView}>
          <View style={{
            flex:30,
            paddingLeft:12,
            justifyContent:'center'
            }}>
            <Text style={styles.dateText}>{inprogressType == 'income' ?'Income' : 'Expense'}</Text>
          </View>
          <View style={{flex:5}}></View>
          <View style={styles.datePickerView}>
            <CurrencyInput
              style={[styles.inputContainer, {textAlign:'right'}]}
              value={inprogressAmount}
              onChangeValue={setInprogressAmount}
              delimiter=","
              separator="."
              precision={2}
              placeholder='0.00'
              maxLength={16}
              keyboardType='decimal-pad'
              placeholderTextColor={lightBlue}
            />
          </View>
          <View style={{
            flex:15, 
            justifyContent:'center',
            alignItems:'center'
            }}>
              <Foundation name='dollar' size={34} color={darkBlue}/>
          </View>
        </View>
        {/*********** Note ***********/}
        <View style={styles.noteView}>
          <View style={{
            flex:20,
            paddingLeft:12,
            justifyContent:'center'
            }}>
            <Text style={styles.dateText}>Note</Text>
          </View>
          <View style={{
            flex:80,
            alignItems:'center',
            justifyContent:'center',
            borderBottomColor:darkYellow,
          }}>
            <TextInput
              style={[styles.noteInputContainer, {textAlign:'left'}]}
              placeholder='Note (optional)'
              placeholderTextColor={lightBlue}
              value={inprogressNote}
              onChangeText={(value) => setInprogressNote(value)}
            />
          </View>
        </View>
        {/*********** Category ***********/}
        <View style={styles.noteView}>
          <View style={{
            flex:22,
            paddingLeft:12,
            justifyContent:'center'
            }}>
            <Text style={styles.dateText}>Category</Text>
          </View>
          <View style={{
              flex:80,
              alignItems:'center',
              justifyContent:'center',
              borderBottomColor:darkYellow,
            }}>
              <Text style={[styles.categoryText, {color:colorC}]}>{inprogressCategory}</Text>
          </View>
        </View>
        <View style={{height:200, alignItems:'center'}}>
          <FlatList
            scrollEnabled={true}
            contentContainerStyle={{alignSelf: 'flex-start'}}
            numColumns={3}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            data={inprogressType == 'income' ? IncomeCategory : ExpenseCategory} 
            renderItem={({item}) => {
              if (!item.isEdit) {
                return (
                  <View style={styles.itemView}>
                    <TouchableOpacity 
                      style={styles.itemButton}
                      onPress={() => {setInprogressCategory(item.name); setColor(item.color)}}>
                      <MaterialCommunityIcons name={item.icon} size={20} color={item.color}/>
                      <Text style={[styles.categoryButtonText, {color:item.color}]}>{' ' + item.name}</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
            }}
          />
        </View>
        {/*********** Submit button ***********/}
        <View style={[styles.submitButtonView, {alignItems:'center', justifyContent:'center', }]}>
          <TouchableOpacity 
          style={[styles.inputButton, {borderRadius:10, backgroundColor:darkYellow,width:120}]} 
          onPress={() => {onSubmitEdit()}}> 
          {/*********** modify function onSubmitEdit and editRow (Ctrl F) ***********/}
            <Text style={styles.cancelText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#fff',
  },
  boldBlueHeaderText: {
    fontSize: 35,
    color: darkBlue,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize:20,
    fontWeight:'bold'
  },
  noteText: {
    fontSize:15,
    fontWeight:'400'
  },
  amountText: {
    fontSize:20,
    fontWeight:'bold'
  },
  headerModal: {
    alignItems:'flex-end', 
    justifyContent:'center',
    backgroundColor:'#fff',
    borderBottomColor:'#808080',
    borderBottomWidth:1,
    height: StatusBarHeight + 48,
  },
  cancelText: {
    fontSize:18,
    color:'#fff',
    fontWeight:'500',
  },
  submitButtonView: {
    marginTop: 10, 
    alignItems:'center',
    justifyContent:'center',
    paddingBottom:4,
    paddingTop:4,
    paddingLeft:4,
    borderBottomColor: '#E9E9E9',
    borderTopColor: '#E9E9E9',     
    height:48
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
  propertiesView: {
    flexDirection:'row',
    paddingBottom:7,
    paddingTop:7,
    paddingLeft:4,
    borderBottomColor: '#E9E9E9',
    borderTopColor: '#E9E9E9',
    borderTopWidth:1,            
    height:48
  },
  dateView: {
    flexDirection:'row',
    paddingBottom:7,
    paddingTop:7,
    paddingLeft:4,
    borderBottomColor: '#E9E9E9',
    borderTopColor: '#E9E9E9',
    borderTopWidth:1,            
    height:48
  },
  dateText: {
    fontSize: 19,
    fontWeight: '600',
    color: darkBlue,
  },
  datePickerOffText: {
    fontSize: 18,
    fontWeight: '400',
    color: lightBlue,
  },
  datePickerView: {
    flex:55,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#FDEE87',
    borderRadius:20
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
  noteView: {
    flexDirection:'row',
    paddingBottom:4,
    paddingTop:4,
    paddingLeft:4,
    borderBottomColor: '#E9E9E9',
    borderTopColor: '#E9E9E9',  
    borderTopWidth:1,      
    //borderBottomWidth:1,    
    height:48
  },
  noteInputContainer: {
    color:darkBlue,
    borderColor: darkBlue,
    paddingRight: 12,
    width:210,
    borderRadius: 10,
    borderBottomWidth:1,
    fontSize: 17,
    fontWeight:'400',
    height: 36,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '500',
  },
  itemView: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    height: 50,
    width:(ScreenWidth-15)/3, 
  },
  itemButton: {
    flexDirection: 'column',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:10,
    backgroundColor:'#fff',
    width:ScreenWidth/3-15,
    shadowColor:'#999',
    shadowOffset: {width:0,height:1},
    shadowOpacity:0.8,
    shadowRadius:2,
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalView: {
    flex:1, 
    justifyContent:'flex-end', 
    backgroundColor:'#000000aa',
    shadowOffset: {width:0,height:1},
    shadowOpacity:0.8,
    shadowRadius:2,
    elevation:5,
  }
})

export default EditItemScreen;