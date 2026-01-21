
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import { GroceryItem } from '../types/grocery'
import GroceriesFilter from './GroceriesFilter'

type Props = {}

const UserDashboard = async({groceries}: {groceries: GroceryItem[]}) => {
  


  return (
    <>
      <HeroSection />
      <CategorySlider />
      <GroceriesFilter groceries={groceries}/>
    </>

  )
}

export default UserDashboard