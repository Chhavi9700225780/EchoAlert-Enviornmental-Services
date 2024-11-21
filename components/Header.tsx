// @ts-nocheck
'use client'
import { useState, useEffect, } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import AuthDialog from "./AuthDialog";
import { useDebounce } from "@/hooks/use-debounce";
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Web3Auth } from "@web3auth/modal"
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { createUser, getUnreadNotifications, markNotificationAsRead, getUserByEmail, getUserBalance, getList } from "@/utils/db/actions"
//=============================
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from 'lucide-react'
import { Label } from "@/components/ui/lable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import { toast } from 'react-hot-toast'
import { registerUserAction, registerOrgAction, loginOrgAction,loginUserAction } from "@/utils/db/actions";
import { useRouter } from 'next/navigation';
import NGOList from "./NGOList"

interface NGO {
  id: number;
  companyName: string;
  email: string;
  location: string;
  workType: string;
  password: string;
  createdAt: Date;
}

interface NGOListProps {
  ngos: NGO[];
}
interface AuthDialogProps {
  type1: "login" ;
}
interface AuthDialogProps {
  type2: "register" ;
}
//====================================================

const clientId = process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, // Changed from SAPPHIRE_MAINNET to TESTNET
  privateKeyProvider,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}
const mockNGOs = [
  {
    id: 1,
    name: "Global Education Initiative",
    description: "Providing quality education to underprivileged children worldwide",
    location: "New York, USA",
    category: "Education",
    volunteers: 250,
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&q=80&w=600&h=600",
  },
  {
    id: 2,
    name: "Ocean Conservation Society",
    description: "Protecting marine ecosystems and promoting sustainable practices",
    location: "Sydney, Australia",
    category: "Environment",
    volunteers: 180,
    image: "https://images.unsplash.com/photo-1596753365498-2d23bbf47a34?auto=format&fit=crop&q=80&w=600&h=600",
  },
  {
    id: 3,
    name: "Hunger Relief Network",
    description: "Fighting food insecurity in local communities",
    location: "London, UK",
    category: "Food Security",
    volunteers: 420,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600&h=600",
  },
];

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [balance, setBalance] = useState(0)
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [type1, setType1] = useState("login");
  const [type2, setType2] = useState("register");
  const [type3, setType3] = useState("");
  const [web,setWeb]= useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sett, setSett] = useState<NGO[]>([]); // Change the type to NGO[]

  const router = useRouter();

  const searchNGOs = (query: string) => {
    if (!query.trim()) return [];
    return mockNGOs.filter(
      (ngo) =>
        ngo.name.toLowerCase().includes(query.toLowerCase()) ||
        ngo.description.toLowerCase().includes(query.toLowerCase()) ||
        ngo.location.toLowerCase().includes(query.toLowerCase()) ||
        ngo.category.toLowerCase().includes(query.toLowerCase())
    );
  };

  const results = searchNGOs(debouncedSearch);
  const showResults = debouncedSearch.trim().length > 0;

  console.log('user info', userInfo);



  //==================================================
  const [isSubmitting, setIsSubmitting] = useState(false)
 
  
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    name: "",
    lastName: "",
  });

  // State for organization inputs
  const [orgData, setOrgData] = useState({
    email: "",
    password: "",
    companyName: "",
    workType: "",
    location: "",
  });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrgData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(userData);
    console.log(orgData);
   setIsSubmitting(true);
         if(type3=="register"){
            try{
              console.log("User",userData);
              const result = await registerUserAction(userData);
              console.log(result);
              
              if (result?.success){
                const user = await getUserByEmail(userData.email);
              console.log("User", user);
                setUserInfo(user);
                console.log("User Registration SuccessfulLy Done");
                setIsSubmitting(false);
                setIsOpen2(false);
                localStorage.setItem('userEmail', userData.email);
                setLoggedIn(true);
                alert( "User Successfully Registered");
               
              }else{
                setIsSubmitting(false);
                setIsOpen2(false);
                alert( result.message);
                

              }
              setUserData({
                email: "",
                password: "",
                name: "",
                lastName: "",
              });
            }
            catch(e){
                      console.log("Something Went wrong :", e);
                      setIsOpen2(false);
                      alert( "Somthing went wrong Pls Try Again");
                
            }
            setIsSubmitting(false);
            setIsOpen2(false);
         }else{
          try{
            const result = await loginUserAction(userData);
            console.log(result);
            
            console.log("login Successful");
            if (result?.success){
              const user = await getUserByEmail(userData.email);
              console.log("User", user);
                setUserInfo(user);
              localStorage.setItem('userEmail', userData.email);
              console.log("User login Successfully Done");
              setIsSubmitting(false);
              setIsOpen3(false);
              
              setLoggedIn(true);
              
              alert( "User Successfully login");
             
            }else{
              

              alert( result.message);
              setIsSubmitting(false);
              setIsOpen3(false);
              
            }
            setUserData({
              email: "",
              password: "",
              name: "",
              lastName: "",
            });
          }catch(e){
                    console.log("Something Went wrong :", e);
                    setIsOpen3(false);
                    alert( "Somthing went wrong");
                
                   
          }      
          setIsOpen3(false);
          setIsSubmitting(false);
         }
    
   
   
  };

  
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      
        try {
          const result = await getList();
          console.log("Fetched Setting:", result);
          if (result) {
            // Ensure result is an array of NGOs
            setSett(Array.isArray(result) ? result : [result]);
          }
        } catch (e) {
          console.log("Something went wrong", e);
        } finally {
          setLoading(false);
        }
      
    };

    fetchSettings();
  }, []);

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(userData);
    console.log(orgData);
    if(type3=="register"){
      try{
        const result = await registerOrgAction(orgData);
        console.log(result);
        console.log("Organization Registration Successfully Done");
        if (result?.success){
          console.log("Organization Registration Successfully Done ");
          setIsSubmitting(false);
          setIsOpen2(false);
          localStorage.setItem('orgEmail', orgData.email);
          alert( "Organization Successfully Registered");
          
          
              
         
        }else{
          setIsSubmitting(false);
          setIsOpen2(false);
          alert(result.message);
        }
        setOrgData({
          email: "",
          password: "",
          companyName: "",
          workType: "",
          location: "",
        });
      }
      catch(e){
                console.log("Something Went wrong :", e);
                setIsSubmitting(false);
                setIsOpen2(false);
                alert( "Somthing went wrong");
                
               
      }
      setIsSubmitting(false);
      setIsOpen2(false);
      
   }else{
    try{
      const result = await loginOrgAction(orgData);
      console.log(result);
      console.log("login Successful");
      if (result?.success){
        console.log("login Successful");
        setIsSubmitting(false);
        setIsOpen3(false);
        localStorage.setItem('orgEmail', orgData.email);
        alert( "Organization Successfully login");
        
        
       
       
      }else{
        setIsSubmitting(false);
        setIsOpen3(false);
        alert(result.message);
      }
      setOrgData({
        email: "",
        password: "",
        companyName: "",
        workType: "",
        location: "",
      });
    }catch(e){
              console.log("Something Went wrong :", e);
              setIsOpen3(false);
              alert( "Somthing went wrong");
             
    }      
    setIsSubmitting(false);
    setIsOpen3(false);
   }
    
    
  };
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };


























  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);
          if (user.email) {
            localStorage.setItem('userEmail', user.email);
            try {
              await createUser(user.email, user.name || 'Anonymous User');
            } catch (error) {
              console.error("Error creating user:", error);
              // Handle the error appropriately, maybe show a message to the user
            }
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    fetchNotifications();

    // Set up periodic checking for new notifications
    const notificationInterval = setInterval(fetchNotifications, 30000); // Check every 30 seconds

    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          console.log("User Balance chhave:", userBalance);
          setBalance(userBalance);
        }
      }
    };

    fetchUserBalance();

    // Add an event listener for balance updates
    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);

    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  },  );

  const login = async () => {
    setIsOpen3(false);
    setWeb(false);
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      console.log(web3authProvider);
      setProvider(web3authProvider);
      setLoggedIn(true);
      setWeb(false);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        try {
          await createUser(user.email, user.name || 'Anonymous User');
        } catch (error) {
          console.error("Error creating user:", error);
          // Handle the error appropriately, maybe show a message to the user
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
console.log(web);
  const logout = async () => {
    if(web){
    window.location.reload();
    setLoggedIn(false);
    setLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem('userEmail');
    }
    else{
    if(web3auth) {
      try {
        await web3auth.logout();
        setProvider(null);
        setLoggedIn(false);
        setUserInfo(null);
        localStorage.removeItem('userEmail');
      } catch (error) {
        console.error("Error during logout:", error);
      }}
    }
    
  };

  const getUserInfo = async () => {
    if (web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        try {
          await createUser(user.email, user.name || 'Anonymous User');
        } catch (error) {
          console.error("Error creating user:", error);
          // Handle the error appropriately, maybe show a message to the user
        }
      }
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  if (loading) {
    return <div>Loading Web3Auth...</div>;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:mr-4" onClick={onMenuClick}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg text-gray-800">EcoAlert</span>
              <span className="text-[8px] md:text-[10px] text-gray-500 -mt-1">CDOnline24</span>
            </div>
          </Link>
        </div>
        {!isMobile && (
  <div className="relative w-full max-w-xl mx-4">
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
    
    {showResults && (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className="bg-white border rounded-lg shadow-lg p-4 text-center">
            <p className="text-gray-500">
              No NGOs found matching your search criteria
            </p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg shadow-lg">
            <NGOList ngos={sett} />
          </div>
        )}
      </div>
    )}
  </div>
)}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2">
              <Search className="h-5 w-5" />
              
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{notification.type}</span>
                      <span className="text-sm text-gray-500">{notification.message}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
            <span className="font-semibold text-sm md:text-base text-gray-800">
              {balance.toFixed(2)}
            </span>
          </div>
          {!loggedIn ? (
           /* <Button onClick={login} className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base">
              Login
              <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
           </Button>*/
           <div className="hidden md:flex items-center gap-2"
           
          >
           
           <Dialog open={isOpen3} onOpenChange={setIsOpen3}>
           <DialogTrigger asChild>
             <Button
               variant={type1 === "register" ? "default" : "outline"}
               className={type1 === "register" ? "bg-green-600 hover:bg-green-700" : ""}
               onClick={()=>setType3("login")}
             >
               {type1 === "login" ? "Sign In" : "Sign Up"}
             </Button>
           </DialogTrigger>
           <DialogContent 
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            
           className="sm:max-w-[425px]">
             <DialogHeader>
               <DialogTitle id="dialog-title" className="text-2xl font-bold text-center">
                 {type1 === "login" ? "Sign In" : "Sign Up"}
               </DialogTitle>
             </DialogHeader>
             <Tabs  defaultValue="student" className="w-full">
               <TabsList className="grid w-full grid-cols-2">
                 <TabsTrigger value="student">User</TabsTrigger>
                 <TabsTrigger value="employer">Organization</TabsTrigger>
               </TabsList>
               <TabsContent value="student">
                 <div className="space-y-4 mt-4">
                 {type1 === "login" &&(
                   <> 
                   <Button
                     type="button"
                     variant="outline"
                     className="w-full flex items-center justify-center gap-2"
                     onClick={login}
                   >
                     <svg className="w-5 h-5" viewBox="0 0 24 24">
                       <path
                         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                         fill="#4285F4"
                       />
                       <path
                         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                         fill="#34A853"
                       />
                       <path
                         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                         fill="#FBBC05"
                       />
                       <path
                         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                         fill="#EA4335"
                       />
                     </svg>
                     Continue with Google
                   </Button>
                    <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  </>
                 )}
                  
                   <form onSubmit={handleUserSubmit} className="space-y-4">
                     <div className="space-y-2">
                       <Label htmlFor="student-email">Email</Label>
                       <Input
                         id="student-email"
                         type="email"
                         name="email"
                         value={userData.email}
                         onChange={handleUserChange}
                         placeholder="Enter your email"
                         required
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="student-password">Password</Label>
                       <Input
                         id="student-password"
                         type="password"
                         name="password"
                         value={userData.password}
                         onChange={handleUserChange}
                         placeholder="Enter your password"
                         required
                       />
                     </div>
                     {type1 === "register" && (
                       <>
                         <div className="space-y-2">
                           <Label htmlFor="student-first-name">First Name</Label>
                           <Input
                             id="student-first-name"
                             type="text"
                             name="name"
                             value={userData.name}
                             onChange={handleUserChange}
                             placeholder="Enter your first name"
                             required
                           />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="student-last-name">Last Name</Label>
                           <Input
                             id="student-last-name"
                             type="text"
                             name="lastName"
                             value={userData.lastName}
                             onChange={handleUserChange}
                             placeholder="Enter your last name"
                             required
                           />
                         </div>
                       </>
                     )}
                     <Button
                     type="submit" 
                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg rounded-xl transition-colors duration-300 flex items-center justify-center"
                     
                     disabled={isSubmitting}
                     >{isSubmitting ? (
                       <>
                       
                         <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                         {type1 === "login" ? "Sign In" : "Sign Up"}
                       </>
                     ) : (type1 === "login") ? "Sign In" : "Sign Up"}
                       
                     </Button>
     
                     {type1 === "login" && (
                       <p className="text-center text-sm text-gray-600">
                         New to website?{" "}
                         <Button
                           variant="link"
                           className="p-0 h-auto font-semibold text-green-600"
                           onClick={() => {
                             setIsOpen3(false);
                             setIsOpen2(true);
                             setTimeout(() => {
                               const signUpButton = document.querySelector('[data-type="register"]') as HTMLButtonElement;
                               signUpButton?.click();
                             }, 100);
                           }}
                         >
                           Sign Up
                         </Button>
                       </p>
                     )}
                   </form>
                 </div>
               </TabsContent>
               <TabsContent value="employer">
                 <div className="space-y-4 mt-4">
                 {type1 === "login" &&
                  <> <Button
                     type="button"
                     variant="outline"
                     className="w-full flex items-center justify-center gap-2"
                     onClick={handleGoogleSignIn}
                   >
                     <svg className="w-5 h-5" viewBox="0 0 24 24">
                       <path
                         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                         fill="#4285F4"
                       />
                       <path
                         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                         fill="#34A853"
                       />
                       <path
                         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                         fill="#FBBC05"
                       />
                       <path
                         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                         fill="#EA4335"
                       />
                     </svg>
                     Continue with Google
                   </Button>
                   
                 
                 <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <Separator />
                 </div>
                 <div className="relative flex justify-center text-xs uppercase">
                   <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                 </div>
               </div>
               
               </>
                   }
                  
                   <form onSubmit={handleOrgSubmit} className="space-y-4">
                     <div className="space-y-2">
                       <Label htmlFor="employer-email">Work Email</Label>
                       <Input
                         id="employer-email"
                         type="email"
                         name="email"
                         value={orgData.email}
                         onChange={handleOrgChange}
                         placeholder="Enter your work email"
                         required
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="employer-password">Password</Label>
                       <Input
                         id="employer-password"
                         type="password"
                         name="password"
                         value={orgData.password}
                         onChange={handleOrgChange}
                         placeholder="Enter your password"
                         required
                       />
                     </div>
                     {type1 === "register" && (
                       <>
                       <div className="grid grid-cols-2 gap-2">
                         <div className="space-y-2">
                           <Label htmlFor="company-name">Organization Name</Label>
                           <Input
                             id="O-name"
                             type="text"
                             name="companyName"
                             value={orgData.companyName}
                             onChange={handleOrgChange}
                             placeholder="Enter company name"
                             required
                           />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="company-website">Organization's Work type</Label>
                           <select
             id="workType"
             name="workType"
             value={orgData.workType}
                             onChange={handleOrgChange}
             required
             className="border p-2 rounded-md focus:ring-green-500 focus:ring-2 focus:border-green-500"
           >
             <option value="Garbage Collection">Garbage Collection</option>
             <option value="Water Wastage">Water Wastage</option>
             <option value="Other">Other</option>
           </select>
                         </div>
                        
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="company-website">Organization's Location</Label>
                           <Input
                             id="O-Location"
                             type="text"
                             name="location"
                             value={orgData.location}
                             onChange={handleOrgChange}
                             placeholder="Delhi NCR"
                             required
                           />
                         </div>
                       </>
                     )}
                    
                     <Button
                     type="submit" 
                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg rounded-xl transition-colors duration-300 flex items-center justify-center"
                     
                     disabled={isSubmitting}
                     >{isSubmitting ? (
                       <>
                       
                         <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                         {type1 === "login" ? "Sign In" : "Sign Up"}
                       </>
                     ) : (type1 === "login") ? "Sign In" : "Sign Up"}
                       
                     </Button>
                     {type1 === "login" && (
                       <p className="text-center text-sm text-gray-600">
                         New to website?{" "}
                         <Button
                           variant="link"
                           className="p-0 h-auto font-semibold text-green-600 "
                           onClick={() => {
                             setIsOpen(false);
                             setTimeout(() => {
                               const signUpButton = document.querySelector('[data-type="register"]') as HTMLButtonElement;
                               signUpButton?.click();
                             }, 100);
                           }}
                         >
                           Sign Up
                         </Button>
                       </p>
                     )}
                   </form>
                 </div>
               </TabsContent>
             </Tabs>
           </DialogContent>
         </Dialog>
          
          
         <Dialog open={isOpen2} onOpenChange={setIsOpen2}>
          <DialogTrigger asChild>
            <Button
              variant={type2 === "register" ? "default" : "outline"}
              className={type2 === "register" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={()=>setType3("register")}
            >
            Sign Up
            </Button>
          </DialogTrigger>
          <DialogContent 
           aria-labelledby="dialog-title"
           aria-describedby="dialog-description"
           
          className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle id="dialog-title" className="text-2xl font-bold text-center">
                Sign Up
              </DialogTitle>
            </DialogHeader>
            <Tabs  defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">User</TabsTrigger>
                <TabsTrigger value="employer">Organization</TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <div className="space-y-4 mt-4">
               
                 
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email</Label>
                      <Input
                        id="student-email"
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleUserChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <Input
                        id="student-password"
                        type="password"
                        name="password"
                        value={userData.password}
                        onChange={handleUserChange}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    {type2 === "register" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="student-first-name">First Name</Label>
                          <Input
                            id="student-first-name"
                            type="text"
                            name="name"
                            value={userData.name}
                            onChange={handleUserChange}
                            placeholder="Enter your first name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-last-name">Last Name</Label>
                          <Input
                            id="student-last-name"
                            type="text"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleUserChange}
                            placeholder="Enter your last name"
                            required
                          />
                        </div>
                      </>
                    )}
                    <Button
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg rounded-xl transition-colors duration-300 flex items-center justify-center"
                    
                    disabled={isSubmitting}
                    >{isSubmitting ? (
                      <>
                      
                        <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Sign Up
                      </>
                    ) : "Sign UP"}
                      
                    </Button>
    
                   
                      
                  </form>
                </div>
              </TabsContent>
              <TabsContent value="employer">
                <div className="space-y-4 mt-4">
               
                 
                  <form onSubmit={handleOrgSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employer-email">Work Email</Label>
                      <Input
                        id="employer-email"
                        type="email"
                        name="email"
                        value={orgData.email}
                        onChange={handleOrgChange}
                        placeholder="Enter your work email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employer-password">Password</Label>
                      <Input
                        id="employer-password"
                        type="password"
                        name="password"
                        value={orgData.password}
                        onChange={handleOrgChange}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    {type2 === "register" && (
                      <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Organization Name</Label>
                          <Input
                            id="O-name"
                            type="text"
                            name="companyName"
                            value={orgData.companyName}
                            onChange={handleOrgChange}
                            placeholder="Enter company name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-website">Organization's Work type</Label>
                          <select
            id="workType"
            name="workType"
            value={orgData.workType}
                            onChange={handleOrgChange}
            required
            className="border p-2 rounded-md focus:ring-green-500 focus:ring-2 focus:border-green-500"
          >
            <option value="Garbage Collection">Garbage Collection</option>
            <option value="Water Wastage">Water Wastage</option>
            <option value="Other">Other</option>
          </select>
                        </div>
                       
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-website">Organization's Location</Label>
                          <Input
                            id="O-Location"
                            type="text"
                            name="location"
                            value={orgData.location}
                            onChange={handleOrgChange}
                            placeholder="Delhi NCR"
                            required
                          />
                        </div>
                      </>
                    )}
                   
                    <Button
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg rounded-xl transition-colors duration-300 flex items-center justify-center"
                    
                    disabled={isSubmitting}
                    >{isSubmitting ? (
                      <>
                      
                        <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Sign Up
                      </>
                    ) : "Sign Up"}
                      
                    </Button>
                   
                       
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
           
        </div>
            
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex items-center">
                  <User className="h-5 w-5 mr-1" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={getUserInfo}>
                  {userInfo ? userInfo.name : "Fetch User Info"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">Profile</Link>
                </DropdownMenuItem>
               
                <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}