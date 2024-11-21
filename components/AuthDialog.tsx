"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface AuthDialogProps {
  type: "login" | "register";
}



export default function AuthDialog({ type }: AuthDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
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
    
         if(type=="register"){
            try{
              console.log("User",userData);
              const result = await registerUserAction(userData);
              console.log(result);
              
              if (result?.success){
                console.log("User Registration SuccessfulLy Done");
                toast({
                  title: "Success",
                  description: "User Successfully Registered",
                  
                });
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
                      toast({
                        title: "Error",
                        description: "Something Went wrong",
                        
                      });
            }
         }else{
          try{
            const result = await loginUserAction(userData);
            console.log(result);
            console.log("login Successful");
            if (result?.success){
              console.log("User login Successfully Done");
              
              toast({
                title: "Success",
                description: "User Successfully login",
                
              });
            }
            setUserData({
              email: "",
              password: "",
              name: "",
              lastName: "",
            });
          }catch(e){
                    console.log("Something Went wrong :", e);
                    alert("Somthing went wrong");
          }      
         }
    
    toast({
      title: "Coming soon!",
      description: "Authentication will be implemented with PostgreSQL.",
    });
    setIsOpen(false);
  };
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(userData);
    console.log(orgData);
    if(type=="register"){
      try{
        const result = await registerOrgAction(orgData);
        console.log(result);
        console.log("Organization Registration Successfully Done");
        if (result?.success){
          console.log("Organization Registration Successfully Done ");
          
          toast({
            title: "Success",
            description: "Organization Registration Successfully",
            
          });
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
                toast({
                  title: "Error",
                  description: "Somthing went wrong",
                  
                });
               
      }
   }else{
    try{
      const result = await loginOrgAction(orgData);
      console.log(result);
      console.log("login Successful");
      if (result?.success){
        console.log("login Successful");
        toast({
          title: "Success",
          description: "Organization Successfully Login",
          
        });
       
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
              toast({
                title: "Error",
                description: "Somthing went wrong",
                
              });
             
    }      
   }
    toast({
      title: "Coming soon!",
      description: "Authentication will be implemented with PostgreSQL.",
    });
    setIsOpen(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={type === "register" ? "default" : "outline"}
          className={type === "register" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {type === "login" ? "Sign In" : "Sign Up"}
        </Button>
      </DialogTrigger>
      <DialogContent 
       aria-labelledby="dialog-title"
       aria-describedby="dialog-description"
       
      className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle id="dialog-title" className="text-2xl font-bold text-center">
            {type === "login" ? "Sign In" : "Sign Up"}
          </DialogTitle>
        </DialogHeader>
        <Tabs  defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">User</TabsTrigger>
            <TabsTrigger value="employer">Organization</TabsTrigger>
          </TabsList>
          <TabsContent value="student">
            <div className="space-y-4 mt-4">
            {type === "login" &&(
              <>
              <Button
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
                {type === "register" && (
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
                    {type === "login" ? "Sign In" : "Sign Up"}
                  </>
                ) : (type === "login") ? "Sign In" : "Sign Up"}
                  
                </Button>

                {type === "login" && (
                  <p className="text-center text-sm text-gray-600">
                    New to website?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold text-green-600"
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
          <TabsContent value="employer">
            <div className="space-y-4 mt-4">
            {type === "login" &&
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
                {type === "register" && (
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
                    {type === "login" ? "Sign In" : "Sign Up"}
                  </>
                ) : (type === "login") ? "Sign In" : "Sign Up"}
                  
                </Button>
                {type === "login" && (
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
  );
}