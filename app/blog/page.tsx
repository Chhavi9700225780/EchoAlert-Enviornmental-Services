"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Heart, MessageCircle, Send, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createComment, createPost, getOrgByEmail, getPosts, getUserByEmail, toggleLike } from "@/utils/db/actions";

// Temporary mock data until we integrate with the database
const mockPosts = [
  {
    id: 1,
    title: "The Future of Technology",
    content: "As we look ahead to the future of technology, artificial intelligence and machine learning continue to reshape our world in unprecedented ways...",
    authorName: "John Doe",
   // authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    createdAt: new Date().toISOString(),
    likes: 15,
    comments: [
      { 
        id: 1, 
        content: "This is such an insightful perspective!", 
        authorName: "Alice Smith",
       // authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        createdAt: new Date().toISOString() 
      },
    ],
  },
  {
    id: 2,
    title: "Sustainable Living in 2024",
    content: "Exploring practical ways to reduce our carbon footprint and live more sustainably in our daily lives...",
    authorName: "Sarah Wilson",
   // authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: 23,
    comments: [],
  },
];
interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  comments: {
    content: string;
    authorId: string;
    authorName: string;
    id: number;
    createdAt: Date;
    postId: number;
  }[];
  likes: any[];  // Update this with a more specific type if needed
}
type FormData = {
  title: string;
  content: string;
};
type Data = {
  title: string;
  content: string;
  authorId:number;
  authorName:string;
};

export default function BlogPage(){
 
  const [posts, setPosts] = useState<Post[]>([]);
  const { register,  reset } = useForm<FormData>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authorImage,setAuthorImage] = useState("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop");
  const [data,setData] = useState<Data>({
    title: "",
    content: "",
    authorId: 0,
    authorName:"",
  });

  const handleFormChange = (e:any) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };
    const handleSubmit = async(e:React.FormEvent)=>{
        e.preventDefault();
        console.log("Data", data);
        setIsDialogOpen(false);
        const userEmail = localStorage.getItem('userEmail');
        const orgEmail = localStorage.getItem('orgEmail');
        
      console.log("email",userEmail);
      console.log("email",orgEmail);
      
      if (userEmail) {
        let user = await getUserByEmail(userEmail);
        console.log("user", user);
        if(user){
          data.authorId = user.id;
          data.authorName= user.name;
         
          console.log("Modified Dtata",data);

         try{
             const result = await createPost(data);
             if(result?.success){
              console.log("message", result);
              setData({
                title: "",
                content: "",
                authorId: 0,
                authorName:"",
              });
             }
         }catch(error){
                console.log("Error while creating Posts", error);
         }
          
          
        }
      }
        if (orgEmail) {
          let org = await getOrgByEmail(orgEmail);
          console.log("org", org);
          if(org){
            data.authorId = org.id;
            data.authorName = org.companyName;
            
            console.log("Modified Dtata",data);
            try{
              const result = await createPost(data);
              if(result?.success){
               console.log("message", result);
               setData({
                 title: "",
                 content: "",
                 authorId: 0,
                 authorName:"",
               });
              }
          }catch(error){
                 console.log("Error while creating Posts", error);
          }
           
            }
          }
        
    }

    useEffect(()=>{
      const getAllPosts = async ()=>{
        try{
           const allPosts = await getPosts();
           if(allPosts?.success){
            console.log("Message after Feching all posts:", allPosts );
            const ans = allPosts.posts;
            setPosts(ans);
           }
        }
        catch(error){
          console.log("Error while fetching Posts:",error);
        }
    }
    getAllPosts();
  },[])


 

  
  const handleLike = async (postId: number) => {
    let userId = 'un123'; // Example: Replace with the actual logged-in user's ID
    const userEmail = localStorage.getItem('userEmail');
    const orgEmail = localStorage.getItem('orgEmail');
    
  console.log("email",userEmail);
  console.log("email",orgEmail);
  
  if (userEmail) {
    let user = await getUserByEmail(userEmail);
    console.log("user", user);
    if(user){
     userId = user.id.toString(); 
      
    }
  }
    if (orgEmail) {
      let org = await getOrgByEmail(orgEmail);
      console.log("org", org);
      if(org){
        userId = org.id.toString();
       
        }
      }
    
    try {
      const response = await toggleLike({ postId, userId });
      if (response.action === "liked") {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: [...post.likes, userId] } : post
          )
        );
      } else if (response.action === "unliked") {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes.filter((id) => id !== userId) }
              : post
          )
        );
      }
    } catch (error) {
      console.log("Error while toggling like:", error);
    }
  };

  
  const handleComment = async (postId: number, content: string) => {
    let userId = 'user123'; // Example: Replace with actual user ID
    let userName = "John Doe"; // Replace with actual user name
    const userEmail = localStorage.getItem('userEmail');
    const orgEmail = localStorage.getItem('orgEmail');
    
  console.log("email",userEmail);
  console.log("email",orgEmail);
  
  if (userEmail) {
    let user = await getUserByEmail(userEmail);
    console.log("user", user);
    if(user){
     userId = user.id.toString(); 
      userName = user.name;
    }
  }
    if (orgEmail) {
      let org = await getOrgByEmail(orgEmail);
      console.log("org", org);
      if(org){
        userId = org.id.toString();
        userName = org.companyName;
        }
      }
    try {
      const response = await createComment({
        content,
        postId,
        authorId: userId,
        authorName: userName,
      });
      if (response.comment) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, comments: [...post.comments, response.comment] }
              : post
          )
        );
      }
    } catch (error) {
        console.log("Error while adding comment:", error);
      }
    };
 // Function to toggle comment visibility
 
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-gray-600 mt-2">Share your thoughts with the community</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2  bg-green-600 hover:bg-green-700">
                <PenSquare className="h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={data.title}
                    onChange={handleFormChange}
                    className="mt-1 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                    placeholder="Enter your post title"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={data.content}
                    onChange={handleFormChange}
                    className="mt-1 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                    rows={5}
                    placeholder="Write your post content here..."
                  />
                </div>
                <Button type="submit" className="w-full  bg-green-600 hover:bg-green-700">
                  Publish Post
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {posts.length > 0 && posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={authorImage} alt={post.authorName} />
                  <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="font-medium">{post.authorName}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">{post.content}</p>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className={`h-4 w-4 ${post.likes.length > 0 ? 'fill-current text-red-500' : ''}`} />
                  {post.likes.length}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2"
               
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comments.length}
                </Button>
              </div>

              { post.comments.length > 0 && (
                <div className="mt-6">
                  <Separator className="my-4" />
                  <h3 className="font-medium mb-4">Comments</h3>
                  <div className="space-y-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={authorImage} alt={comment.authorName} />
                          <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.authorName}</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t flex gap-2">
                <Input 
                className=" border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                  placeholder="Add a comment..." 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleComment(post.id, (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button size="icon" className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}