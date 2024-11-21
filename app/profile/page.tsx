"use client"
import { getOrgSettingByEmail } from "@/utils/db/actions";
import { ArrowRight, MapPin, Mail, Phone, Recycle, Users, Heart, TreePine, Loader } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
type UserSettings = {
    description:string;
    email: string;
    companyName: string;
    workType: string;
    location: string;
    imageUrl: string | null;
    phone: string;
  }
  
export default function Profile() {
   
    const [settings, setSettings] = useState<Array<{
        
            description:string;
            email: string;
            companyName: string;
            workType: string;
            location: string;
            imageUrl: string | null;
            phone: string;
          
    }>>([]);
      const [loading, setLoading] = useState(true);

      useEffect(()=>{
        const set = async()=>{
          setLoading(true)
          const orgEmail = localStorage.getItem('orgEmail');
          if(orgEmail){
            try{
              const result = await getOrgSettingByEmail(orgEmail);
              console.log("Fetched Setting:",result);
              if(result){
              const num : string = result.imageUrl !== null ? result.imageUrl : "";
              const settingsWithDefaults = {
                companyName: result.email,
                workType:result.companyName,
                email: result.workType,
                imageUrl: "",
                description:result.description,
                phone: num,
                location: result.location || "Unknown Address",
    
                 // default value if address is missing
                 // default empty array if notificationsts is missing
              };
               
              setSettings([settingsWithDefaults]);
            
               
            }
            }catch(e){
                 console.log("somthing went wrong");
            }finally {
              setLoading(false);
    
            }
          
          }
        }
        set();
      },[]);

  return (<>
    {loading? ( <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-gray-500" />
        </div>):(<>
            {settings.map((set)=>(
                   
                   <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
                   {/* Hero Section */}
                   <div className="relative mb-20 h-[60vh] bg-green-800">
                     <Image
                       src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=3270"
                       alt="Environmental Impact"
                       fill
                       className="object-cover opacity-40"
                       priority
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="text-center text-white p-8">
                         <h1 className="text-5xl md:text-6xl font-bold mb-4">{set.companyName}</h1>
                         <p className="text-xl md:text-2xl max-w-2xl mx-auto">
                           Creating a cleaner, greener future for Ghaziabad
                         </p>
                       </div>
                     </div>
                   </div>
             
                   {/* Main Content */}
                   <div className="max-w-7xl mx-auto  px-4 py-16">
                     {/* Contact Info Cards */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-32 mb-16">
                       <div className="bg-white p-6 rounded-lg shadow-lg">
                         <MapPin className="w-8 h-8 text-green-600 mb-4" />
                         <h3 className="text-lg font-semibold mb-2">Location</h3>
                         <p className="text-gray-600">{set.location}, Uttar Pradesh</p>
                       </div>
                       <div className="bg-white p-6 rounded-lg shadow-lg">
                         <Mail className="w-8 h-8 text-green-600 mb-4" />
                         <h3 className="text-lg font-semibold mb-2">Email</h3>
                         <a href="mailto:sawariyarajputchhavi@gmail.com" className="text-gray-600 hover:text-green-600">
                           {set.email}
                         </a>
                       </div>
                       <div className="bg-white p-6 rounded-lg shadow-lg">
                         <Phone className="w-8 h-8 text-green-600 mb-4" />
                         <h3 className="text-lg font-semibold mb-2">Phone</h3>
                         <a href="tel:+919045634042" className="text-gray-600 hover:text-green-600">
                           +91 {set.phone}
                         </a>
                       </div>
                     </div>
             
                     {/* About Section */}
                     <div className="mb-16">
                       <h2 className="text-3xl font-bold mb-8 text-center">About Our Mission</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                         <div className="space-y-6">
                           <p className="text-gray-700 leading-relaxed">
                            {set.description}
                           </p>
                           
                         </div>
                         <div className="relative h-[400px] rounded-lg overflow-hidden">
                           <Image
                             src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=3313"
                             alt="Community Impact"
                             fill
                             className="object-cover rounded-lg"
                           />
                         </div>
                       </div>
                     </div>
             
                     {/* Impact Stats */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                       <div className="text-center">
                         <Recycle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                         <h3 className="text-2xl font-bold mb-2">1000+</h3>
                         <p className="text-gray-600">Tons Collected</p>
                       </div>
                       <div className="text-center">
                         <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                         <h3 className="text-2xl font-bold mb-2">5000+</h3>
                         <p className="text-gray-600">Community Members</p>
                       </div>
                       <div className="text-center">
                         <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                         <h3 className="text-2xl font-bold mb-2">100+</h3>
                         <p className="text-gray-600">Volunteers</p>
                       </div>
                       <div className="text-center">
                         <TreePine className="w-12 h-12 text-green-600 mx-auto mb-4" />
                         <h3 className="text-2xl font-bold mb-2">50+</h3>
                         <p className="text-gray-600">Green Initiatives</p>
                       </div>
                     </div>
             
                     {/* CTA Section */}
                     <div className="bg-green-800 text-white rounded-2xl p-12 text-center">
                       <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
                       <p className="max-w-2xl mx-auto mb-8">
                         Together, we can create a sustainable future for our community. Get involved in our initiatives and help make a difference.
                       </p>
                       <button className="bg-white text-green-800 px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:bg-green-100 transition-colors">
                         Get Involved
                         <ArrowRight className="w-5 h-5" />
                       </button>
                     </div>
                   </div>
                 </main>

            ))}

          </>

          )
    }</>
  );
}