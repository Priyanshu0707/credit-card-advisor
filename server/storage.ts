import {
  users,
  creditCards,
  userFavorites,
  chatHistory,
  type User,
  type UpsertUser,
  type CreditCard,
  type InsertCreditCard,
  type UserFavorite,
  type InsertUserFavorite,
  type ChatHistory,
  type InsertChatHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, asc, count, inArray, isNull, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Credit Card operations
  getCards(offset: number, limit: number, filters?: {
    search?: string;
    issuer?: string;
    cardType?: string;
    sortBy?: string;
  }): Promise<{ cards: CreditCard[], total: number }>;
  getCardById(id: number): Promise<CreditCard | undefined>;
  createCard(card: InsertCreditCard): Promise<CreditCard>;
  initializeCards(): Promise<void>;

  // Favorites operations
  getUserFavorites(userId: string): Promise<(UserFavorite & { card: CreditCard })[]>;
  addToFavorites(userId: string, cardId: number): Promise<UserFavorite>;
  removeFromFavorites(userId: string, cardId: number): Promise<void>;
  isCardFavorited(userId: string, cardId: number): Promise<boolean>;

  // Chat operations
  saveChatMessage(message: InsertChatHistory): Promise<ChatHistory>;
  getChatHistory(userId: string, sessionId: string): Promise<ChatHistory[]>;
  getRecommendations(userId: string, preferences: any): Promise<CreditCard[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Credit Card operations
  async getCards(offset: number, limit: number, filters?: {
    search?: string;
    issuer?: string;
    cardType?: string;
    sortBy?: string;
  }): Promise<{ cards: CreditCard[], total: number }> {
    // Apply filters
    const conditions = [eq(creditCards.isActive, true)];
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(creditCards.name, `%${filters.search}%`),
          ilike(creditCards.issuer, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.issuer && filters.issuer !== 'All Issuers') {
      conditions.push(eq(creditCards.issuer, filters.issuer));
    }

    if (filters?.cardType && filters.cardType !== 'All Types') {
      conditions.push(eq(creditCards.cardType, filters.cardType));
    }

    const whereCondition = and(...conditions);

    // Build the queries directly
    const baseQuery = db.select().from(creditCards);
    const baseCountQuery = db.select({ count: count() }).from(creditCards);

    let query, countQuery;

    if (whereCondition) {
      query = baseQuery.where(whereCondition);
      countQuery = baseCountQuery.where(whereCondition);
    } else {
      query = baseQuery;
      countQuery = baseCountQuery;
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'Lowest Annual Fee':
        query = query.orderBy(asc(creditCards.annualFee));
        break;
      case 'Highest Cashback':
        query = query.orderBy(desc(creditCards.rewardRate));
        break;
      default:
        query = query.orderBy(desc(creditCards.createdAt));
    }

    // Apply pagination
    query = query.offset(offset).limit(limit);

    const [cards, totalResult] = await Promise.all([
      query,
      countQuery
    ]);

    return {
      cards,
      total: totalResult[0]?.count || 0
    };
  }

  async getCardById(id: number): Promise<CreditCard | undefined> {
    const [card] = await db.select().from(creditCards).where(eq(creditCards.id, id));
    return card;
  }

  async createCard(card: InsertCreditCard): Promise<CreditCard> {
    const [newCard] = await db.insert(creditCards).values(card).returning();
    return newCard;
  }

  async initializeCards(): Promise<void> {
    // Check if cards already exist
    const existingCards = await db.select({ count: count() }).from(creditCards);
    if (existingCards[0].count > 0) {
      return; // Cards already initialized
    }

    // Insert Indian credit cards data
    const indianCreditCards: InsertCreditCard[] = [
      {
        name: "HDFC Regalia",
        issuer: "HDFC Bank",
        joiningFee: "2500",
        annualFee: "2500",
        rewardType: "Cashback & Points",
        rewardRate: "4% on Dining, 2% on Grocery",
        eligibilityCriteria: "Monthly income ₹25,000+, Credit Score 750+",
        specialPerks: ["Airport Lounge Access", "Travel Insurance", "Dining Privileges"],
        affiliateLink: "https://example.com/hdfc-regalia",
        applyLink: "https://hdfcbank.com/apply-regalia",
        cardType: "Travel",
        minCreditScore: 750,
        minIncome: "25000"
      },
      {
        name: "ICICI Amazon Pay",
        issuer: "ICICI Bank",
        joiningFee: "0",
        annualFee: "0",
        rewardType: "Cashback",
        rewardRate: "5% on Amazon, 2% elsewhere",
        eligibilityCriteria: "Monthly income ₹20,000+, Credit Score 700+",
        specialPerks: ["Amazon Prime Benefits", "No Annual Fee", "Instant Approval"],
        affiliateLink: "https://example.com/icici-amazon",
        applyLink: "https://icicibank.com/apply-amazon",
        cardType: "Cashback",
        minCreditScore: 700,
        minIncome: "20000"
      },
      {
        name: "SBI Simply Save",
        issuer: "State Bank of India",
        joiningFee: "499",
        annualFee: "499",
        rewardType: "Reward Points",
        rewardRate: "10% on Dining, 5% on Grocery",
        eligibilityCriteria: "Monthly income ₹15,000+, Credit Score 650+",
        specialPerks: ["Dining Rewards", "Fuel Surcharge Waiver", "Movie Discounts"],
        affiliateLink: "https://example.com/sbi-simplysave",
        applyLink: "https://sbi.co.in/apply-simplysave",
        cardType: "Dining",
        minCreditScore: 650,
        minIncome: "15000"
      },
      {
        name: "Axis Magnus",
        issuer: "Axis Bank",
        joiningFee: "12500",
        annualFee: "12500",
        rewardType: "Miles & Points",
        rewardRate: "25 Edge Miles per ₹200",
        eligibilityCriteria: "Monthly income ₹150,000+, Credit Score 800+",
        specialPerks: ["Priority Pass", "Golf Benefits", "Travel Credits", "Concierge"],
        affiliateLink: "https://example.com/axis-magnus",
        applyLink: "https://axisbank.com/apply-magnus",
        cardType: "Travel",
        minCreditScore: 800,
        minIncome: "150000"
      },
      {
        name: "Kotak League Platinum",
        issuer: "Kotak Bank",
        joiningFee: "999",
        annualFee: "999",
        rewardType: "Reward Points",
        rewardRate: "6% on Movies, 4% on Dining",
        eligibilityCriteria: "Monthly income ₹30,000+, Credit Score 720+",
        specialPerks: ["Movie Tickets", "Dining Offers", "Fuel Benefits"],
        affiliateLink: "https://example.com/kotak-league",
        applyLink: "https://kotakbank.com/apply-league",
        cardType: "Entertainment",
        minCreditScore: 720,
        minIncome: "30000"
      },
      {
        name: "YES First Exclusive",
        issuer: "YES Bank",
        joiningFee: "2999",
        annualFee: "2999",
        rewardType: "Reward Points",
        rewardRate: "3% Universal Rewards",
        eligibilityCriteria: "Monthly income ₹50,000+, Credit Score 750+",
        specialPerks: ["Priority Pass", "Concierge Services", "Travel Benefits"],
        affiliateLink: "https://example.com/yes-first",
        applyLink: "https://yesbank.in/apply-first",
        cardType: "Premium",
        minCreditScore: 750,
        minIncome: "50000"
      },
      {
        name: "Standard Chartered Ultimate",
        issuer: "Standard Chartered",
        joiningFee: "4999",
        annualFee: "4999",
        rewardType: "Miles & Points",
        rewardRate: "5X Rewards on Dining & Travel",
        eligibilityCriteria: "Monthly income ₹100,000+, Credit Score 780+",
        specialPerks: ["Hotel Upgrades", "Travel Credits", "Golf Benefits"],
        affiliateLink: "https://example.com/sc-ultimate",
        applyLink: "https://sc.com/apply-ultimate",
        cardType: "Travel",
        minCreditScore: 780,
        minIncome: "100000"
      },
      {
        name: "AMEX Platinum Travel",
        issuer: "American Express",
        joiningFee: "3500",
        annualFee: "3500",
        rewardType: "Membership Rewards",
        rewardRate: "18 Points per ₹100",
        eligibilityCriteria: "Monthly income ₹60,000+, Credit Score 760+",
        specialPerks: ["Taj Benefits", "Airport Transfer", "Travel Insurance"],
        affiliateLink: "https://example.com/amex-platinum",
        applyLink: "https://americanexpress.com/apply",
        cardType: "Travel",
        minCreditScore: 760,
        minIncome: "60000"
      },
      {
        name: "HDFC Millennia",
        issuer: "HDFC Bank",
        joiningFee: "1000",
        annualFee: "1000",
        rewardType: "Cashback",
        rewardRate: "5% on Online Shopping, 2.5% elsewhere",
        eligibilityCriteria: "Monthly income ₹25,000+, Credit Score 720+",
        specialPerks: ["Online Shopping Rewards", "No Forex Markup", "Instant Discounts"],
        affiliateLink: "https://example.com/hdfc-millennia",
        applyLink: "https://hdfcbank.com/apply-millennia",
        cardType: "Cashback",
        minCreditScore: 720,
        minIncome: "25000"
      },
      {
        name: "ICICI Sapphiro",
        issuer: "ICICI Bank",
        joiningFee: "3500",
        annualFee: "3500",
        rewardType: "Reward Points",
        rewardRate: "3.3% on Dining & International",
        eligibilityCriteria: "Monthly income ₹75,000+, Credit Score 750+",
        specialPerks: ["Airport Lounge", "Golf Benefits", "Concierge"],
        affiliateLink: "https://example.com/icici-sapphiro",
        applyLink: "https://icicibank.com/apply-sapphiro",
        cardType: "Travel",
        minCreditScore: 750,
        minIncome: "75000"
      },
      {
        name: "SBI Card PRIME",
        issuer: "SBI Card",
        joiningFee: "2999",
        annualFee: "2999",
        rewardType: "Reward Points",
        rewardRate: "5X on Dining, Entertainment",
        eligibilityCriteria: "Monthly income ₹30,000+, Credit Score 700+",
        specialPerks: ["Movie Benefits", "Dining Privileges", "Fuel Surcharge Waiver"],
        affiliateLink: "https://example.com/sbi-prime",
        applyLink: "https://sbicard.com/apply-prime",
        cardType: "Entertainment",
        minCreditScore: 700,
        minIncome: "30000"
      },
      {
        name: "Axis Privilege",
        issuer: "Axis Bank",
        joiningFee: "1500",
        annualFee: "1500",
        rewardType: "Miles",
        rewardRate: "2X Miles on Travel",
        eligibilityCriteria: "Monthly income ₹40,000+, Credit Score 730+",
        specialPerks: ["Travel Miles", "Golf Benefits", "Priority Check-in"],
        affiliateLink: "https://example.com/axis-privilege",
        applyLink: "https://axisbank.com/apply-privilege",
        cardType: "Travel",
        minCreditScore: 730,
        minIncome: "40000"
      },
      {
        name: "HDFC MoneyBack",
        issuer: "HDFC Bank",
        joiningFee: "500",
        annualFee: "500",
        rewardType: "Cashback",
        rewardRate: "20% on Utility Bills, 5% on Groceries",
        eligibilityCriteria: "Monthly income ₹15,000+, Credit Score 650+",
        specialPerks: ["Utility Cashback", "Grocery Rewards", "Fuel Benefits"],
        affiliateLink: "https://example.com/hdfc-moneyback",
        applyLink: "https://hdfcbank.com/apply-moneyback",
        cardType: "Cashback",
        minCreditScore: 650,
        minIncome: "15000"
      },
      {
        name: "ICICI Platinum",
        issuer: "ICICI Bank",
        joiningFee: "199",
        annualFee: "199",
        rewardType: "Reward Points",
        rewardRate: "2% on Dining, 1% elsewhere",
        eligibilityCriteria: "Monthly income ₹20,000+, Credit Score 680+",
        specialPerks: ["Dining Offers", "Movie Discounts", "Fuel Surcharge Waiver"],
        affiliateLink: "https://example.com/icici-platinum",
        applyLink: "https://icicibank.com/apply-platinum",
        cardType: "Dining",
        minCreditScore: 680,
        minIncome: "20000"
      },
      {
        name: "Kotak Royale Signature",
        issuer: "Kotak Bank",
        joiningFee: "1999",
        annualFee: "1999",
        rewardType: "Reward Points",
        rewardRate: "4% on Dining & Travel",
        eligibilityCriteria: "Monthly income ₹50,000+, Credit Score 740+",
        specialPerks: ["Priority Pass", "Travel Benefits", "Concierge"],
        affiliateLink: "https://example.com/kotak-royale",
        applyLink: "https://kotakbank.com/apply-royale",
        cardType: "Travel",
        minCreditScore: 740,
        minIncome: "50000"
      },
      {
        name: "YES Prosperity Cashback",
        issuer: "YES Bank",
        joiningFee: "750",
        annualFee: "750",
        rewardType: "Cashback",
        rewardRate: "5% on Groceries, 3% on Fuel",
        eligibilityCriteria: "Monthly income ₹25,000+, Credit Score 700+",
        specialPerks: ["Grocery Cashback", "Fuel Benefits", "Utility Rewards"],
        affiliateLink: "https://example.com/yes-prosperity",
        applyLink: "https://yesbank.in/apply-prosperity",
        cardType: "Cashback",
        minCreditScore: 700,
        minIncome: "25000"
      },
      {
        name: "IndusInd Pioneer Heritage Metal",
        issuer: "IndusInd Bank",
        joiningFee: "3000",
        annualFee: "3000",
        rewardType: "Reward Points",
        rewardRate: "3% on Dining & Entertainment",
        eligibilityCriteria: "Monthly income ₹75,000+, Credit Score 750+",
        specialPerks: ["Airport Lounge", "Golf Benefits", "Concierge Services"],
        affiliateLink: "https://example.com/indusind-pioneer",
        applyLink: "https://indusind.com/apply-pioneer",
        cardType: "Premium",
        minCreditScore: 750,
        minIncome: "75000"
      },
      {
        name: "RBL Bank World Safari",
        issuer: "RBL Bank",
        joiningFee: "2500",
        annualFee: "2500",
        rewardType: "Travel Points",
        rewardRate: "4% on Travel & Dining",
        eligibilityCriteria: "Monthly income ₹60,000+, Credit Score 720+",
        specialPerks: ["Travel Benefits", "Airport Lounge", "Hotel Privileges"],
        affiliateLink: "https://example.com/rbl-safari",
        applyLink: "https://rblbank.com/apply-safari",
        cardType: "Travel",
        minCreditScore: 720,
        minIncome: "60000"
      },
      {
        name: "IDFC FIRST Wealth",
        issuer: "IDFC FIRST Bank",
        joiningFee: "2000",
        annualFee: "2000",
        rewardType: "Reward Points",
        rewardRate: "6X on Dining, 3X on Others",
        eligibilityCriteria: "Monthly income ₹45,000+, Credit Score 730+",
        specialPerks: ["Airport Lounge", "Golf Benefits", "Dining Privileges"],
        affiliateLink: "https://example.com/idfc-wealth",
        applyLink: "https://idfcfirstbank.com/apply-wealth",
        cardType: "Dining",
        minCreditScore: 730,
        minIncome: "45000"
      },
      {
        name: "AU Bank Zenith",
        issuer: "AU Small Finance Bank",
        joiningFee: "1500",
        annualFee: "1500",
        rewardType: "Cashback",
        rewardRate: "3% on Online Spends",
        eligibilityCriteria: "Monthly income ₹35,000+, Credit Score 710+",
        specialPerks: ["Online Shopping Rewards", "Movie Benefits", "Fuel Surcharge Waiver"],
        affiliateLink: "https://example.com/au-zenith",
        applyLink: "https://aubank.in/apply-zenith",
        cardType: "Cashback",
        minCreditScore: 710,
        minIncome: "35000"
      },
      {
        name: "Federal Bank Signet",
        issuer: "Federal Bank",
        joiningFee: "999",
        annualFee: "999",
        rewardType: "Reward Points",
        rewardRate: "4% on Utilities, 2% on Groceries",
        eligibilityCriteria: "Monthly income ₹25,000+, Credit Score 690+",
        specialPerks: ["Utility Benefits", "Grocery Rewards", "Fuel Benefits"],
        affiliateLink: "https://example.com/federal-signet",
        applyLink: "https://federalbank.co.in/apply-signet",
        cardType: "Utility",
        minCreditScore: 690,
        minIncome: "25000"
      },
      {
        name: "BOB Eterna",
        issuer: "Bank of Baroda",
        joiningFee: "2999",
        annualFee: "2999",
        rewardType: "Reward Points",
        rewardRate: "5% on Travel, 3% on Dining",
        eligibilityCriteria: "Monthly income ₹50,000+, Credit Score 720+",
        specialPerks: ["Travel Benefits", "Airport Lounge", "Golf Privileges"],
        affiliateLink: "https://example.com/bob-eterna",
        applyLink: "https://bankofbaroda.in/apply-eterna",
        cardType: "Travel",
        minCreditScore: 720,
        minIncome: "50000"
      },
      {
        name: "PNB Select",
        issuer: "Punjab National Bank",
        joiningFee: "1499",
        annualFee: "1499",
        rewardType: "Reward Points",
        rewardRate: "3% on Dining & Entertainment",
        eligibilityCriteria: "Monthly income ₹30,000+, Credit Score 700+",
        specialPerks: ["Dining Offers", "Movie Benefits", "Fuel Surcharge Waiver"],
        affiliateLink: "https://example.com/pnb-select",
        applyLink: "https://pnbindia.in/apply-select",
        cardType: "Entertainment",
        minCreditScore: 700,
        minIncome: "30000"
      },
      {
        name: "Canara Bank Platinum",
        issuer: "Canara Bank",
        joiningFee: "750",
        annualFee: "750",
        rewardType: "Reward Points",
        rewardRate: "2% on All Spends",
        eligibilityCriteria: "Monthly income ₹20,000+, Credit Score 650+",
        specialPerks: ["Universal Rewards", "Fuel Benefits", "Movie Discounts"],
        affiliateLink: "https://example.com/canara-platinum",
        applyLink: "https://canarabank.com/apply-platinum",
        cardType: "General",
        minCreditScore: 650,
        minIncome: "20000"
      },
      {
        name: "Union Bank of India Platinum",
        issuer: "Union Bank of India",
        joiningFee: "500",
        annualFee: "500",
        rewardType: "Reward Points",
        rewardRate: "1.5% on All Purchases",
        eligibilityCriteria: "Monthly income ₹18,000+, Credit Score 640+",
        specialPerks: ["Low Annual Fee", "Fuel Surcharge Waiver", "Utility Benefits"],
        affiliateLink: "https://example.com/ubi-platinum",
        applyLink: "https://unionbankofindia.co.in/apply-platinum",
        cardType: "General",
        minCreditScore: 640,
        minIncome: "18000"
      }
    ];

    // Insert cards in batches
    await db.insert(creditCards).values(indianCreditCards);
  }

  // Favorites operations
  async getUserFavorites(userId: string): Promise<(UserFavorite & { card: CreditCard })[]> {
    const result = await db
      .select({
        id: userFavorites.id,
        userId: userFavorites.userId,
        cardId: userFavorites.cardId,
        createdAt: userFavorites.createdAt,
        card: {
          id: creditCards.id,
          name: creditCards.name,
          issuer: creditCards.issuer,
          joiningFee: creditCards.joiningFee,
          annualFee: creditCards.annualFee,
          rewardType: creditCards.rewardType,
          rewardRate: creditCards.rewardRate,
          eligibilityCriteria: creditCards.eligibilityCriteria,
          specialPerks: creditCards.specialPerks,
          affiliateLink: creditCards.affiliateLink,
          applyLink: creditCards.applyLink,
          cardType: creditCards.cardType,
          minCreditScore: creditCards.minCreditScore,
          minIncome: creditCards.minIncome,
          isActive: creditCards.isActive,
          createdAt: creditCards.createdAt,
        }
      })
      .from(userFavorites)
      .innerJoin(creditCards, eq(userFavorites.cardId, creditCards.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));
    
    return result as (UserFavorite & { card: CreditCard })[];
  }

  async addToFavorites(userId: string, cardId: number): Promise<UserFavorite> {
    const [favorite] = await db
      .insert(userFavorites)
      .values({ userId, cardId })
      .returning();
    return favorite;
  }

  async removeFromFavorites(userId: string, cardId: number): Promise<void> {
    await db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.cardId, cardId)));
  }

  async isCardFavorited(userId: string, cardId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.cardId, cardId)));
    return !!favorite;
  }

  // Chat operations
  async saveChatMessage(message: InsertChatHistory): Promise<ChatHistory> {
    const [chatMessage] = await db.insert(chatHistory).values(message).returning();
    return chatMessage;
  }

  async getChatHistory(userId: string, sessionId: string): Promise<ChatHistory[]> {
    return await db
      .select()
      .from(chatHistory)
      .where(and(eq(chatHistory.userId, userId), eq(chatHistory.sessionId, sessionId)))
      .orderBy(asc(chatHistory.timestamp));
  }

  async getRecommendations(userId: string, preferences: any): Promise<CreditCard[]> {
    try {
      // Parse income (should already be normalized)
      let income = 0;
      if (preferences.monthlyIncome) {
        income = parseInt(preferences.monthlyIncome);
      }

      // Get all active cards and filter them
      const allCards = await db
        .select()
        .from(creditCards)
        .where(eq(creditCards.isActive, true));

      let filteredCards = allCards;

      // Filter by income
      if (income > 0) {
        filteredCards = filteredCards.filter(card => {
          const cardMinIncome = card.minIncome ? parseFloat(card.minIncome) : 0;
          return cardMinIncome <= income;
        });
      }

      // Filter by credit score
      if (preferences.creditScore) {
        const userScore = parseInt(preferences.creditScore);
        filteredCards = filteredCards.filter(card => {
          const cardMinScore = card.minCreditScore || 0;
          return cardMinScore <= userScore;
        });
      }

      // Sort by annual fee (ascending) and take top 5
      filteredCards.sort((a, b) => {
        const feeA = parseFloat(a.annualFee || '0');
        const feeB = parseFloat(b.annualFee || '0');
        return feeA - feeB;
      });

      const recommendations = filteredCards.slice(0, 5);
      
      return recommendations;
      
    } catch (error) {
      console.error("Error in getRecommendations:", error);
      
      // Fallback: return any 5 active cards
      try {
        const fallback = await db
          .select()
          .from(creditCards)
          .where(eq(creditCards.isActive, true))
          .limit(5);

        return fallback;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return [];
      }
    }
  }
}

export const storage = new DatabaseStorage();
