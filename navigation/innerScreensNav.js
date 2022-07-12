import Tabs from './tabs';
import ListOfExpenseCategory from '../screens/ListOfExpenseCategory';
import ListOfIncomeCategory from '../screens/ListOfIncomeCategory';
import EditLimitScreen from '../screens/EditLimitScreen';
import EditItemScreen from '../screens/EditItemScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const InnerScreenNav = () => {
  return (
    <Stack.Navigator initialRouteName="Tabs">
      <Stack.Screen name="Tabs" component={Tabs} options={{headerShown:false}}/>
      <Stack.Screen name="ListOfExpenseCategory" component={ListOfExpenseCategory} options={{headerShown:false}}/>
      <Stack.Screen name="ListOfIncomeCategory" component={ListOfIncomeCategory} options={{headerShown:false}}/>
      <Stack.Screen name="EditLimitScreen" component={EditLimitScreen} options={{headerShown:false}}/>
      <Stack.Screen name="EditItemScreen" component={EditItemScreen} options={{headerShown:false}}/>
    </Stack.Navigator>
  )
}

export default InnerScreenNav;