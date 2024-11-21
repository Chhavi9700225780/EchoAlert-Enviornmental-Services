"use server"
import { db } from './dbConfig';
import { Users, User, Reports, Rewards,posts, comments, likes, CollectedWastes, Notifications, Transactions, Org, UserSetting, OrgSetting } from './schema';
import { eq, sql, and, desc, ne } from 'drizzle-orm';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

 // Assuming you have `db` configured with Drizzle ORM

// Add new columns with default values to avoid data loss


// Then, apply the NOT NULL constraint

interface RegisterUser{
  name: string;
  lastName: string,
  email: string;
  password: string;
}
interface RegisterOrg{
  companyName: string;
  workType: string,
  location:string,
  email: string;
  password: string;
}

export async function getPosts() {
  try {
    const allPosts = await db.query.posts.findMany({
      with: {
        comments: true,
        likes: true,
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return { posts: allPosts, success: "all posts successfully fetched " };
  } catch (error) {
    return { error: "Failed to fetch posts" };
  }
}

export async function createPost({
  title,
  content,
  authorId,
  authorName,
}: {
  title: string;
  content: string;
  authorId: number;
  authorName: string;
}) {
  try {
    const newPost = await db.insert(posts).values({
      title,
      content,
      authorId,
      authorName,
    }).returning();

    return { post: newPost[0], success: " Post Successfully Created"  };
  } catch (error) {
    return { error: "Failed to create post" };
  }
}

export async function createComment({
  content,
  postId,
  authorId,
  authorName,
}: {
  content: string;
  postId: number;
  authorId: string;
  authorName: string;
}) {
  try {
    const newComment = await db.insert(comments).values({
      content,
      postId,
      authorId,
      authorName,
    }).returning();

    return { comment: newComment[0] };
  } catch (error) {
    return { error: "Failed to create comment" };
  }
}

export async function toggleLike({
  postId,
  userId,
}: {
  postId: number;
  userId: string;
}) {
  try {
    const existingLike = await db.query.likes.findFirst({
      where: and(
        eq(likes.postId, postId),
        eq(likes.userId, userId)
      ),
    });

    if (existingLike) {
      await db.delete(likes).where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, userId)
        )
      );
      return { action: "unliked" };
    }

    await db.insert(likes).values({
      postId,
      userId,
    });
    return { action: "liked" };
  } catch (error) {
    return { error: "Failed to toggle like" };
  }
}




export async function loginUserAction(formData:RegisterUser) {
  try {
    const { email, password } = formData;

    // Check if the user exists in the database
    const checkUser = await db.select().from(Users).where(eq(Users.email, email)).limit(1);
    if (checkUser.length === 0) {
      return {
        success: false,
        message: "User does not exist! Please sign up.",
      };
    }

    // Check if password matches
    const checkPassword = await bcryptjs.compare(password, checkUser[0].password);
    if (!checkPassword) {
      return {
        success: false,
        message: "Password is incorrect! Please check.",
      };
    }

    // Create JWT token
    const createdTokenData = {
      id: checkUser[0].id,
      userName: checkUser[0].name,
      email: checkUser[0].email,
    };

    const token = jwt.sign(createdTokenData, "DEFAULT_KEY", {
      expiresIn: "1d",
    });

    const getCookies = cookies();
    getCookies.set("token", token);

    return {
      success: true,
      message: "Login successful.",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong! Please try again.",
    };
  }
}


export async function loginOrgAction(formData:RegisterOrg) {
  try {
    const { email, password } = formData;

    // Check if the user exists in the database
    const checkUser = await db.select().from(Org).where(eq(Org.email, email)).limit(1);
    if (checkUser.length === 0) {
      return {
        success: false,
        message: "User does not exist! Please sign up.",
      };
    }

    // Check if password matches
    const checkPassword = await bcryptjs.compare(password, checkUser[0].password);
    if (!checkPassword) {
      return {
        success: false,
        message: "Password is incorrect! Please check.",
      };
    }

    // Create JWT token
    const createdTokenData = {
      id: checkUser[0].id,
      userName: checkUser[0].companyName,
      email: checkUser[0].email,
    };

    const token = jwt.sign(createdTokenData, "DEFAULT_KEY", {
      expiresIn: "1d",
    });

    const getCookies = cookies();
    getCookies.set("token", token);

    return {
      success: true,
      message: "Login successful.",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong! Please try again.",
    };
  }
}

export async function registerUserAction(formData: RegisterUser) {
  try {
    console.log("Hello");
    const { name, lastName, email, password } = formData;

    // Check if the user already exists
    const checkUser = await db.select().from(Users).where(eq(Users.email, email)).execute();
    console.log("checkUser", checkUser);

    if (checkUser.length > 0) {
      return {
        success: false,
        message: "User already exists! Please try with a different email.",
      };
    }

    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    console.log("Hashed password:", hashedPassword);

    // Create a new user record
    const newlyCreatedUser = await db.insert(Users).values({
      name,
      lastName,
      email,
      password: hashedPassword
    }).returning().execute();
        
    // Convert the result to a plain object (optional)
    const plainUser = JSON.parse(JSON.stringify(newlyCreatedUser[0]));

    return {
      success: true,
      data: plainUser,  // Ensure it's plain data
    };
  } catch (error) {
    console.log(error);
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Something went wrong! Please try again.",
      error:  error,
    };
  }
}





export async function registerOrgAction( formData: RegisterOrg) {
  try {
    const { workType,location, companyName, email, password } = formData;

    // Check if the user already exists
    const checkUser = await db.select().from(Org).where(eq(Org.email, email)).execute();
    if (checkUser.length > 0) {
      return {
        success: false,
        message: "User already exists! Please try with a different email.",
      };
    }

    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create a new user record
    const newlyCreatedOrg = await db.insert(Org).values({
      companyName,
      workType,
      location,
      email,
      password: hashedPassword,
    }).returning().execute();;

    const plainUser = JSON.parse(JSON.stringify(newlyCreatedOrg[0]));

    return {
      success: true,
      data: plainUser,  // Return the newly created user
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong! Please try again.",
      error:error,
    };
  }
}


export async function createUserSetting(email: string, name: string, imageUrl:string, location:string, phone:string) {
  try {
    const [userSetting] = await db.insert(UserSetting).values({ email, name, phone, imageUrl, location }).returning().execute();
    return userSetting;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
    
  }
}
export async function createOrgSetting(email: string,companyName: string, workType:string, imageUrl:string, phone:string,location:string,description:string, ) {
  try {
    const [orgSetting] = await db.insert(OrgSetting).values({ email, companyName, workType,imageUrl,phone,location , description, }).returning().execute();
    return orgSetting;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
    
  }
}


export async function createUser(email: string, name: string, password:string, lastName:string) {
  try {
    const [user] = await db.insert(Users).values({ email, name,password,lastName }).returning().execute();
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
    
  }
}


export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function getUserSettingByEmail(email: string) {
  try {
    const [userSetting] = await db.select().from(UserSetting).where(eq(UserSetting.email, email)).execute();
    return userSetting;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}
export async function getOrgSettingByEmail(email: string) {
  try {
    const [orgSetting] = await db.select().from(OrgSetting).where(eq(OrgSetting.workType, email)).execute();
    return orgSetting;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}


export async function getOrgByEmail(email: string) {
  try {
    const [org] = await db.select().from(Org).where(eq(Org.email, email)).execute();
    return org;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}
export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  description:string,
  imageUrl?: string,
  type?: string,
  verificationResult?: any
) {
  try {
    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        amount,
        description,
        imageUrl,
        verificationResult,
        status: "pending",
      })
      .returning()
      .execute();

    // Award 10 points for reporting waste
    const pointsEarned = 10;
    await updateRewardPoints(userId, pointsEarned);

    // Create a transaction for the earned points
    await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');

    // Create a notification for the user
    await createNotification(
      userId,
      `You've earned ${pointsEarned} points for reporting waste!`,
      'reward'
    );

    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}

export async function getReportsByUserId(userId: number) {
  try {
    const reports = await db.select().from(Reports).where(eq(Reports.userId, userId)).execute();
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function getOrCreateReward(userId: number) {
  try {
    let [reward] = await db.select().from(Rewards).where(eq(Rewards.userId, userId)).execute();
    if (!reward) {
      [reward] = await db.insert(Rewards).values({
        userId,
        name: 'Default Reward',
        collectionInfo: 'Default Collection Info',
        points: 0,
        level: 1,
        isAvailable: true,
      }).returning().execute();
    }
    return reward;
  } catch (error) {
    console.error("Error getting or creating reward:", error);
    return null;
  }
}

export async function updateRewardPoints(userId: number, pointsToAdd: number) {
  try {
    const [updatedReward] = await db
      .update(Rewards)
      .set({ 
        points: sql`${Rewards.points} + ${pointsToAdd}`,
        updatedAt: new Date()
      })
      .where(eq(Rewards.userId, userId))
      .returning()
      .execute();
    return updatedReward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}

export async function createCollectedWaste(reportId: number, collectorId: number, notes?: string) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error("Error creating collected waste:", error);
    return null;
  }
}

export async function getCollectedWastesByCollector(collectorId: number) {
  try {
    return await db.select().from(CollectedWastes).where(eq(CollectedWastes.collectorId, collectorId)).execute();
  } catch (error) {
    console.error("Error fetching collected wastes:", error);
    return [];
  }
}

export async function createNotification(userId: number, message: string, type: string) {
  try {
    const [notification] = await db
      .insert(Notifications)
      .values({ userId, message, type })
      .returning()
      .execute();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function getUnreadNotifications(userId: number) {
  try {
    return await db.select().from(Notifications).where(
      and(
        eq(Notifications.userId, userId),
        eq(Notifications.isRead, false)
      )
    ).execute();
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    await db.update(Notifications).set({ isRead: true }).where(eq(Notifications.id, notificationId)).execute();
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function getPendingReports() {
  try {
    return await db.select().from(Reports).where(eq(Reports.status, "pending")).execute();
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    return [];
  }
}

export async function updateReportStatus(reportId: number, status: string) {
  try {
    const [updatedReport] = await db
      .update(Reports)
      .set({ status })
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating report status:", error);
    return null;
  }
}

export async function getRecentReports(limit: number = 10) {
  try {
    const reports = await db
      .select()
      .from(Reports)
      .orderBy(desc(Reports.createdAt))
      .limit(limit)
      .execute();
    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}
export async function getList(limit: number = 5) {
  try {
    const reports = await db
      .select()
      .from(Org)
      .orderBy(desc(Org.createdAt))
      .limit(limit)
      .execute();
    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}

export async function getWasteCollectionTasks(limit: number = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        description: Reports.description,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .limit(limit)
      .execute();

    return tasks.map(task => ({
      ...task,
      date: task.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function saveReward(userId: number, amount: number) {
  try {
    const [reward] = await db
      .insert(Rewards)
      .values({
        userId,
        name: 'Waste Collection Reward',
        collectionInfo: 'Points earned from waste collection',
        points: amount,
        level: 1,
        isAvailable: true,
      })
      .returning()
      .execute();
    
    // Create a transaction for this reward
    await createTransaction(userId, 'earned_collect', amount, 'Points earned for collecting waste');

    return reward;
  } catch (error) {
    console.error("Error saving reward:", error);
    throw error;
  }
}

export async function saveCollectedWaste(reportId: number, collectorId: number, verificationResult: any) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
        status: 'verified',
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error("Error saving collected waste:", error);
    throw error;
  }
}

export async function updateTaskStatus(reportId: number, newStatus: string, collectorId?: number) {
  try {
    const updateData: any = { status: newStatus };
    if (collectorId !== undefined) {
      updateData.collectorId = collectorId;
    }
    const [updatedReport] = await db
      .update(Reports)
      .set(updateData)
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function getAllRewards() {
  try {
    const rewards = await db
      .select({
        id: Rewards.id,
        userId: Rewards.userId,
        points: Rewards.points,
        level: Rewards.level,
        createdAt: Rewards.createdAt,
        userName: Users.name,
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id))
      .orderBy(desc(Rewards.points))
      .execute();

    return rewards;
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    return [];
  }
}

export async function getRewardTransactions(userId: number) {
  try {
    console.log('Fetching transactions for user ID:', userId)
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    console.log('Raw transactions from database:', transactions)

    const formattedTransactions = transactions.map(t => ({
      ...t,
      date: t.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));

    console.log('Formatted transactions:', formattedTransactions)
    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

export async function getAvailableRewards(userId: number) {
  try {
    console.log('Fetching available rewards for user:', userId);
    
    // Get user's total points
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions.reduce((total, transaction) => {
      return transaction.type.startsWith('earned') ? total + transaction.amount : total - transaction.amount;
    }, 0);

    console.log('User total points:', userPoints);

    // Get available rewards from the database
    const dbRewards = await db
      .select({
        id: Rewards.id,
        name: Rewards.name,
        cost: Rewards.points,
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo,
      })
      .from(Rewards)
      .where(eq(Rewards.isAvailable, true))
      .execute();

    console.log('Rewards from database:', dbRewards);

    // Combine user points and database rewards
    const allRewards = [
      {
        id: 0, // Use a special ID for user's points
        name: "Your Points",
        cost: userPoints,
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste"
      },
      ...dbRewards
    ];

    console.log('All available rewards:', allRewards);
    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

export async function createTransaction(userId: number, type: 'earned_report' | 'earned_collect' | 'redeemed', amount: number, description: string) {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({ userId, type, amount, description })
      .returning()
      .execute();
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function redeemReward(userId: number, rewardId: number) {
  try {
    const userReward = await getOrCreateReward(userId) as any;
    
    if (rewardId === 0) {
      // Redeem all points
      const [updatedReward] = await db.update(Rewards)
        .set({ 
          points: 0,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', userReward.points, `Redeemed all points: ${userReward.points}`);

      return updatedReward;
    } else {
      // Existing logic for redeeming specific rewards
      const availableReward = await db.select().from(Rewards).where(eq(Rewards.id, rewardId)).execute();

      if (!userReward || !availableReward[0] || userReward.points < availableReward[0].points) {
        throw new Error("Insufficient points or invalid reward");
      }

      const [updatedReward] = await db.update(Rewards)
        .set({ 
          points: sql`${Rewards.points} - ${availableReward[0].points}`,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', availableReward[0].points, `Redeemed: ${availableReward[0].name}`);

      return updatedReward;
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
}

export async function getUserBalance(userId: number): Promise<number> {
  const transactions = await getRewardTransactions(userId);
  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
  }, 0);
  console.log(balance);
  return Math.max(balance, 0); // Ensure balance is never negative
}