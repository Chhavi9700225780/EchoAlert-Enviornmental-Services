'use client'
import { useState, useEffect } from 'react'
import { getAllRewards,getAvailableRewards, getUserBalance, getUserByEmail } from '@/utils/db/actions'
import { Loader, Award, User, Trophy, Crown } from 'lucide-react'
import { toast } from 'react-hot-toast';
import './styles.css';

type Reward = {
  id: number
  userId: number
  points: number
  level: number
  createdAt: Date
  userName: string | null
}

export default function LeaderboardPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [lastId, setLastId] = useState<number>(0); // To keep track of the last used ID

  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null)
const [balance, setBalance] = useState(0);
useEffect(() => {
  const fetchUserBalance = async () => {
    setLoading(true)
    const userEmail = localStorage.getItem('userEmail')
    try{
    if (userEmail) {
      const user = await getUserByEmail(userEmail);
      if (user) {
        const userBalance = await getUserBalance(user.id);
        console.log("User Balance chhave:", userBalance);
        const newReward: Reward = {
          id: lastId + 1,// Generating a random ID for the new reward, replace with actual logic if necessary
          userId: user.id,
          points: userBalance, // Assuming the balance is the user's points for this example
          level: 1, // You can adjust this based on your logic or user's level
          createdAt: new Date(), // Current timestamp
          userName: user.name || null, // Set user name if available
        };
        
        setRewards((prevRewards) => {
          // Check if the user already has a reward entry
          const existingRewardIndex = prevRewards.findIndex((reward) => reward.userId === user.id);
          if (existingRewardIndex !== -1) {
            // Update the existing reward if the user already has one
            const updatedRewards = [...prevRewards];
            updatedRewards[existingRewardIndex] = newReward;
            return updatedRewards;
          } else {
            // If the user doesn't have a reward, append the new reward
            return [...prevRewards, newReward];
          }
        });
        setBalance(userBalance);
        setLastId((prevId) => prevId + 1);
    
        // Set the new rewards array by appending the new reward to the previous rewards
       
      }
    }}catch (error) {
      console.error('Error fetching rewards and user:', error)
      toast.error('Failed to load leaderboard. Please try again.')
    } finally {
      setLoading(false)
    }
  };

  fetchUserBalance();

  // Add an event listener for balance updates
 
},  []);
 /*k useEffect(() => {
    const fetchRewardsAndUser = async () => {
      setLoading(true)
      try {
        const fetchedRewards = await getAllRewards()
        console.log("Result:", fetchedRewards);
       
        // Correcting the typo in the original array
        
        
      
        
        const uniqueResult:any = {};

        fetchedRewards.forEach(({ id,userId, points,level,userName }) => {
          if (uniqueResult[userId]) {
            uniqueResult[userId].points += points; // Add points if id exists
          } else {
            uniqueResult[userId] = { id, userId, points,level,userName }; // Initialize the entry if it does not exist
          }
        });
        
        // Convert the uniqueResult object back to an array of objects
        const finalResult :any = Object.values(uniqueResult);
        
        console.log(finalResult);
        setRewards(finalResult);

        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail)
          if (fetchedUser) {
            setUser(fetchedUser)
          } else {
            toast.error('User not found. Please log in again.')
          }
        } else {
          toast.error('User not logged in. Please log in.')
        }
      } catch (error) {
        console.error('Error fetching rewards and user:', error)
        toast.error('Failed to load leaderboard. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRewardsAndUser()
  }, [])*/
 
  return (
    <div className="">
      <div className="max-w-3xl mx-auto leader  p-4">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Leaderboard </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin h-8 w-8 text-gray-600" />
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex justify-between items-center text-white">
                <Trophy className="h-10 w-10" />
                <span className="text-2xl font-bold">Top Performers</span>
                <Award className="h-10 w-10" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward, index) => (
                    <tr key={reward.userId} className={`${user && user.id === reward.userId ? 'bg-indigo-50' : ''} hover:bg-gray-50 transition-colors duration-150 ease-in-out`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index < 3 ? (
                            <Crown className={`h-6 w-6 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-600'}`} />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <User className="h-full w-full rounded-full bg-gray-200 text-gray-500 p-2" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reward.userName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-indigo-500 mr-2" />
                          <div className="text-sm font-semibold text-gray-900">{reward.points.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Level {reward.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}