"use client";
import { MapPin, Users, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOrgByEmail } from "@/utils/db/actions";
import { useRouter } from 'next/navigation';

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

export default function NGOList({ ngos }: NGOListProps) {
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);
  const [sett, setSett] = useState<NGO[]>([]); // Change the type to NGO[]
  const router = useRouter();
 
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const orgEmail = localStorage.getItem('orgEmail');
      if (orgEmail) {
        try {
          const result = await getOrgByEmail(orgEmail);
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
      }
    };

    fetchSettings();
  }, []);

  

  return (
    <>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="divide-y dark:divide-gray-700">
          {ngos.map((ngo) => (
            <div
              key={ngo.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              onClick={() => setSelectedNGO(ngo)}
            >
              <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                <Users className="h-5 w-5 mr-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {ngo.companyName}
                  </h3>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {ngo.workType}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{ngo.location}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />

            </div>


          ))}
         
        </div>
      </ScrollArea>

     
    </>
  );
}