'use client'
import { useEffect, useState } from 'react'
import { User, Mail, Phone, MapPin, Save, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createUserSetting, getUserByEmail, getUserSettingByEmail } from '@/utils/db/actions'

type UserSettings = {
  name: string
  email: string
  phone: string
  imageUrl:string 
  address: string
  notifications: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    imageUrl:"",
    address: '123 Eco Street, Green City, 12345',
    notifications: true,
  })
  const [loading, setLoading] = useState(true)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
  useEffect(()=>{
    const set = async()=>{
      setLoading(true)
      const userEmail = localStorage.getItem('userEmail');
      if(userEmail){
        try{
          const result = await getUserSettingByEmail(userEmail);
          console.log("Fetched Setting:",result);
          if(result){
          
          const settingsWithDefaults = {
            name: result.name,
            email: result.email,
            imageUrl: "",
            phone: result.phone,
            address: result.location || "Unknown Address", // default value if address is missing
            notifications: true,  // default empty array if notificationsts is missing
          };
        
          setSettings(settingsWithDefaults);
        }
        }catch(e){
             console.log("somthing went wrong");
        }finally {
          setLoading(false)
        }
      
      }
    }
    set();
  },[]);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setSettings(settings);
    const userEmail = localStorage.getItem('userEmail');
    const orgEmail = localStorage.getItem('orgEmail');
    
  console.log("email",userEmail);
  console.log("email",orgEmail);
  if(userEmail){
     try{
      const result = await createUserSetting(
        userEmail,
        settings.name,
        settings.imageUrl ,
        settings.address,
        settings.phone
      );
      if(result){
        alert("Settings Successfully Saved");
      }
     }catch(error){
      console.log("error:",error);
        alert("Something Went wrong pls try again");
     }
  }
   
    // Here you would typically send the updated settings to your backend
    console.log('Updated settings:', settings)
    alert('Settings updated successfully!')
  }

  return  (
   
      
       

        <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Account Settings</h1>
       {loading? ( <div className="flex justify-center items-center h-64">
      <Loader className="animate-spin h-8 w-8 text-gray-500" />
      </div>):( <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={settings.name}
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={settings.email}
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={settings.phone}
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <div className="relative">
            <input
              type="text"
              id="address"
              name="address"
              value={settings.address}
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifications"
            name="notifications"
            checked={settings.notifications}
            onChange={handleInputChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
            Receive email notifications
          </label>
        </div>

        <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </form>)
       }
     
     
         </div>
 
  )
}