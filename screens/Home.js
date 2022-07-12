import { StatusBar } from 'expo-status-bar';
import React, {useState, useMemo, useEffect} from 'react';
import { View, Text, TouchableOpacity, Alert, Animated, Modal, TextInput, ScrollView, Pressable, Keyboard, StyleSheet, FlatList} from 'react-native';
import { colors } from '../components/colors';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Switch } from 'react-native-switch';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../api/db';
import { getUserID } from '../api/authentication';
import ActivityRings from "react-native-activity-rings";  
import { StatusBarHeight } from '../components/constants';
import { Octicons, FontAwesome, Feather, MaterialCommunityIcons, Entypo, Foundation } from '@expo/vector-icons'
import { SwipeListView } from 'react-native-swipe-list-view';
import CustomModal from '../components/Containers/CustomModal';
import { Timestamp } from 'firebase/firestore';
const { lightYellow, beige, lightBlue, darkBlue, darkYellow, lighterBlue } = colors

const Home = ({navigation}) => {
  const [userName, setUserName] = useState('quyduc')
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  /*********** Variables ***********/
  const [monthLimit, setMonthLimit] = useState(700); // need to store on Firestore
  const [dayLimit, setDayLimit] = useState(40); // need to store on Firestore
  const [list, setList] = useState([]);
  /*********** Variables ***********/
  const [ finances, setFinances] = useState([])
  const [financesMonth, setFinancesMonth] = useState([])
  const [income, setIncome] = useState(0)
  const [incomeMonth, setIncomeMonth] = useState(0)
  const [incomeDays, setIncomeDays] = useState([])
  const [expense, setExpense] = useState(0)
  const [expenseMonth, setExpenseMonth] = useState(0)
  const [total, setTotal] = useState(0)
  const [expenseDays, setExpenseDays] = useState([])

  const [expenseCategoryList, setExpenseCategoryList] = useState({})
  const [incomeCategoryList, setIncomeCategoryList] = useState({})

  const [chosenCategory, setChosenCategory] = useState('');

  useEffect(() => {
    const expenseCategoryRef = collection(db, 'Input Category/Expense/' + getUserID())

    onSnapshot(expenseCategoryRef, (snapshot) => {
      let expenseCategories = {}
      snapshot.docs.forEach((doc) => {
        expenseCategories[doc.data().name + 'color'] = doc.data().color
        expenseCategories[doc.data().name + 'icon'] = doc.data().icon
      })
      setExpenseCategoryList(expenseCategories)
    })

    const incomeCategoryRef = collection(db, 'Input Category/Income/' + getUserID())

    onSnapshot(incomeCategoryRef, (snapshot) => {
      let incomeCategories = {}
      snapshot.docs.forEach((doc) => {
        incomeCategories[doc.data().name + 'color'] = doc.data().color
        incomeCategories[doc.data().name + 'icon'] = doc.data().icon
      })
      setIncomeCategoryList(incomeCategories)
    })
  }, [])

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

  // get user name to display on screen
  useEffect(() => {
    const docRef = doc(db, "Users", getUserID());
    onSnapshot(docRef, (snapShot) => {
      (snapShot) => {
        if (snapShot.exists()) {
          setUserName(snapShot.data().username)
        } else {
          setUserName('')
        }
      }
    })
  }, [])

  useEffect(() => {
    const financePath = 'Finance/' + getUserID() + '/' + date.substring(0, 4)
    const financeRef = collection(db, financePath)
    const dayQuery = query(financeRef, where('month', '==', date.substring(5, 7)), where('date', '==', date.substring(8, 10)))
    onSnapshot(dayQuery,
      (snapShot) => {
        const finances = []
        const expenses = []
        const incomes = []
        snapShot.forEach((doc) => {
          finances.push({
            type: doc.data().type,
            date: doc.data().date,
            amount: doc.data().amount,
            note: doc.data().note,
            category: doc.data().category,
            icon: doc.data().type == 'expense' ? expenseCategoryList[doc.data().category+'icon'] : incomeCategoryList[doc.data().category+'icon'],
            color: doc.data().type == 'expense' ? expenseCategoryList[doc.data().category+'color'] : incomeCategoryList[doc.data().category+'color'],
            id: doc.id,
            notedAt: doc.data().notedAt
          })
          if (doc.data().type == 'expense') {
            expenses.push(doc.data().amount)
          } else {
            incomes.push(doc.data().amount)
          }
        })
        finances.sort((x, y) => x.notedAt > y.notedAt ? -1 : 1)
        setFinances(finances)
        const totalIncome = incomes.reduce((total, current) => total = total + current, 0);
        setIncome(totalIncome.toFixed(2))
        const totalExpense = expenses.reduce((total, current) => total = total + current, 0);
        setExpense(totalExpense.toFixed(2))
      }
    )
    const monthQuery = query(financeRef, where('month', '==', date.substring(5, 7)))
    onSnapshot(monthQuery,
      (snapShot) => {
        const expensesMonth = []
        const incomesMonth = []
        const expenseDays = []
        const incomeDays = []
        snapShot.forEach((doc) => {
          if (doc.data().type = 'expense') {
            expensesMonth.push(doc.data().amount)
            expenseDays.push(doc.data().date)
          } else {
            incomesMonth.push(doc.data().amount)
            incomeDays.push(doc.data().date)
          }
        })
        const totalIncomeMonth = incomesMonth.reduce((total, current) => total = total + current, 0);
        setIncomeMonth(totalIncomeMonth.toFixed(2))
        setIncomeDays(incomeDays)
        setExpenseDays(expenseDays)
        const totalExpenseMonth = expensesMonth.reduce((total, current) => total = total + current, 0);
        setExpenseMonth(totalExpenseMonth.toFixed(2))
        setTotal(totalIncomeMonth - totalExpenseMonth)
      }
    )
  }, [incomeCategoryList, expenseCategoryList])

  /*********** Activity ring config ***********/
  const activityData = [ 
    //the rings are disappear when the values equal 0 or more than 1
    { value: expenseMonth/monthLimit > 1 ? 1 :(expenseMonth == 0? 0.0000001 : expenseMonth/700), color:darkBlue }, 
    { value: expense/dayLimit > 1 ? 1 : (expense == 0 ? 0.0000001 : expense/50), color:darkYellow }, 
  ];

  const activityConfig = { 
    width: 150,  
    height: 150,
    ringSize:20
  };

  const alertChangeLimit = () => {
    Alert.alert("Adjust your expense limit?","", [
      {text: 'Cancel', onPress: () => console.log('Alert closed')},
      {text: 'Yes', onPress: () => {navigation.navigate('EditLimitScreen')}}
    ]);
  }
  /*********** SwipeListView stuffs ***********/
  const HiddenItemWithActions = props => {
    const {swipeAnimatedValue, onEdit, onDelete} = props;
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity style={[styles.backRightButton, styles.backRightButtonLeft]} onPress={onEdit}>
          <Feather name="edit-3" size={25} color="#fff"/>  
        </TouchableOpacity>
        <TouchableOpacity style={[styles.backRightButton, styles.backRightButtonRight]} onPress={onDelete}>
          <Animated.View style={[styles.trash, {
            transform: [
              {
                scale:swipeAnimatedValue.interpolate({
                  inputRange: [-90,-45],
                  outputRange:[1,0],
                  extrapolate:'clamp',
                }),
              },
            ],
          }]}>
            <Octicons name="trash" size={24} color="#fff"/>
          </Animated.View>
        </TouchableOpacity>
      </View>
    )
  }

  const renderHiddenItem = (data, rowMap) => {
    return (
      <HiddenItemWithActions
        data={data}
        rowMap={rowMap}
        onEdit={()=>{
            navigation.navigate('EditItemScreen', {
            inprogressAmount:data.item.amount.toString(),
            inprogressCategory:data.item.category,
            inprogressDate:moment().format('YYYY-MM-DD'),
            inprogressNote:data.item.note,
            inprogressType:data.item.type,
            inprogressId:data.item.id,
            color:data.item.color,
          })
        }}
        onDelete={()=>alertDelete(rowMap, data.item.key, data.item.id)}
      />
    )
  }

  const VisibleItem = props => {
    const {data} = props;
    return (
      <View style={[styles.rowFront, {backgroundColor: data.item.type == 'income' ? '#e2f5e2' : '#fdddcf'}]}>
        <View style={{flex:3, paddingLeft:15, flexDirection:'column'}}>
          <View style={{flexDirection:'row', marginBottom:3}}>
            <View style={{marginRight:10}}>
              <MaterialCommunityIcons name={data.item.icon} color={data.item.color} size={20}/>
            </View>
            <Text style={styles.categoryText}>{data.item.category}</Text>
          </View>
          {data.item.note != '' && 
          <View>
            <Text style={styles.noteText}>{data.item.note}</Text>
          </View>}
        </View>
        <View style={{flex:3,alignItems:'flex-end', justifyContent:'center', paddingRight:15}}>
          <Text style={[styles.amountText,{color:data.item.type == 'income' ? '#26b522' : '#ef5011'}]}>{'$' + data.item.amount.toFixed(2)}</Text>
        </View>
      </View>
    )
  }

  const renderItem = (data, rowMap) => {
    return <VisibleItem data={data}/>
  }

  /*************** Function to alert when deleting ***************/
  const alertDelete = (rowMap, rowKey, id) => {
    Alert.alert("Delete this record?","", [
      {text: 'Cancel', onPress: () => {closeRow(rowMap, rowKey)}},
      {text: 'Delete', onPress: () => {deleteRow(id)}}
    ]);
  }
  /*************** Function to delete record ***************/
  const deleteRow = (id) => {
    const cat = doc(db, 'Finance/' + getUserID() + '/' + date.substring(0, 4), id)
    deleteDoc(cat)
  }
  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  }

  return (
    <>
      <View style={styles.container}>
        {/************ Header ************/}
        <View style={styles.header}>
          <View>
            <Text style={styles.boldBlueHeaderText}>Welcome,</Text>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.boldBlueHeaderText}>{userName + " !"}</Text>
            </View>
          </View>
        </View>
        <View style={styles.footer}> 
          {/************ Limit ring ************/}
          <TouchableOpacity style={{flexDirection:'column'}} onPress={() => {alertChangeLimit()}}>
            <View style={styles.ringView}>
              <View style={{height:35, alignItems:'center', justifyContent:'center'}}>
                <Text style={{fontSize:20, fontWeight:'600', color:darkYellow}}>Spending limit</Text>
              </View>
              <View style={{flexDirection:'row'}}>
                <View style={{marginRight:4,flex: 1.3}}>
                  <ActivityRings theme='dark' data={activityData} config={activityConfig}/>
                </View> 
                <View style={{flexDirection:'column', flex: 2, alignContent:'center',justifyContent:'center'}}>
                  <View style={{flexDirection:'row', margin:5}}>
                    <Octicons name='dot-fill' size={40} color={darkBlue}/>
                    <View style={{alignContent:'center',justifyContent:'center'}}>
                      <Text style={{fontWeight:'500', fontSize:15}}>{' Month limit: ' + expenseMonth + '/' + monthLimit + '$'}</Text>
                      {expenseMonth>monthLimit && <Text style={{color:'#ef5011', fontWeight:'bold'}}>{' Exceeded!!!'}</Text>}
                    </View>
                  </View>
                  <View style={{flexDirection:'row', margin:5}}>
                    <Octicons name='dot-fill' size={40} color={darkYellow}/>
                    <View style={{alignContent:'center',justifyContent:'center'}}>
                      <Text style={{fontWeight:'500', fontSize:15}}>{' Day limit: ' + expense + '/' + dayLimit + '$'}</Text>
                      {expense>dayLimit && <Text style={{color:'#ef5011', fontWeight:'bold'}}>{' Exceeded!!!'}</Text>}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/************ Today's records ************/}
          <View>
            <View style={{alignItems:'center', justifyContent:'center', paddingBottom:7}}>
              <Text style={{fontSize:16, fontWeight:'700', color:darkBlue}}>{"Today: " + moment().format('DD-MM-YYYY')}</Text>
            </View>
            <View style={{flexDirection:'row', marginHorizontal:10, marginBottom:10}}>
              <View style={[styles.incomeexpenseView, {backgroundColor:'#e2f5e2'}]}>
                <FontAwesome name='plus-circle' color={'#26b522'} size={18}/>
                <Text style={{color:'#26b522', fontSize:16, fontWeight:'500'}}>{" Income: $" + income}</Text>
              </View>
              <View style={[styles.incomeexpenseView, {backgroundColor:'#fdddcf'}]}>
                <FontAwesome name='minus-circle' color={'#ef5011'} size={18}/>
                <Text style={{color:'#ef5011', fontSize:16, fontWeight:'500'}}>{" Expense: $" + expense}</Text>
              </View>
            </View>
          </View>
          {/************ List ************/}
          <View style={{height: 320}}>
            {finances.length != 0 && <SwipeListView 
              data={finances}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-150}
              disableRightSwipe
              showsVerticalScrollIndicator={true}
            />}
            {finances.length == 0 && 
              <View style={{alignItems:'center', justifyContent:'center', paddingTop:20}}>
                <Feather name='x-circle' size={110} color='#e0e0e0'/>
                <Text style={{fontSize:40, color:'#e0e0e0', fontWeight:'bold'}}>No data yet!</Text>
              </View>
            }
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: lighterBlue,
  },
  header: {
    flex:1,
    justifyContent:'flex-end',
    paddingHorizontal:30,
    paddingBottom:14,
  },
  footer: {
    flex:3.7,
    backgroundColor:'#fff',
    borderTopLeftRadius:30,
    borderTopRightRadius:30,
    paddingHorizontal:15,
    paddingVertical:18,
  },
  boldBlueHeaderText: {
    fontSize: 35,
    color: darkBlue,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  ringView: {
    flexDirection:'column',
    backgroundColor: '#fff',
    borderRadius:25,
    height:193,
    margin:5,
    marginBottom:10,
    shadowColor:'#999',
    shadowOffset: {width:0,height:1},
    shadowOpacity:0.8,
    shadowRadius:2,
    elevation:5,
    paddingLeft:10
  },
  incomeexpenseView: {
    flexDirection:'row',
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:10,
    marginHorizontal:7,
    marginBottom:5,
    height:40,
    shadowColor:'#999',
    shadowOffset: {width:0,height:1},
    shadowOpacity:0.8,
    shadowRadius:2,
  },
  rowFront: {
    flexDirection:'row',
    backgroundColor: '#fff',
    alignItems:'center',
    borderRadius:10,
    height:55,
    marginHorizontal: 5, 
    marginBottom:10,
    shadowColor:'#999',
    shadowOffset: {width:0,height:1},
    shadowOpacity:0.8,
    shadowRadius:2,
    elevation:5,
  },
  rowFrontVisible: {
    backgroundColor:'#fff',
    borderRadius:5,
    height:55,
    padding:10,
    marginBottom:15,
  },
  rowBack: {
    alignItems:'center',
    backgroundColor:'#DDD',
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    paddingLeft:15,
    margin:5,
    marginBottom:15,
    borderRadius:5,
  },
  backRightButton: {
    bottom:0,
    alignItems:'center',
    justifyContent:'center',
    position:'absolute',
    top:0,
    width:75, 
  },
  backRightButtonLeft: {
    backgroundColor:'#1f65ff',
    right:75,
    height:55, 
    marginTop:-5
  },
  backRightButtonRight: {
    backgroundColor:'red',
    right:0,
    borderTopRightRadius:11,
    borderBottomRightRadius:11,
    height:55, 
    marginTop:-5
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
    fontWeight: '600',
  },
  itemView: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    height: 50,
    width:138, 
  },
  itemButton: {
    flexDirection: 'column',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:10,
    backgroundColor:'#fff',
    width:128,
    shadowColor:'#999',
    shadowOffset: {width:0,height:1},
    shadowOpacity:0.8,
    shadowRadius:2,
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  }
})

export default Home;