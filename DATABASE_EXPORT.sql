-- Complete database export for production deployment
-- Run this after setting up your Neon database and running 'npm run db:push'

INSERT INTO credit_cards (name, issuer, joining_fee, annual_fee, reward_type, reward_rate, eligibility_criteria, special_perks, affiliate_link, apply_link, card_type, min_credit_score, min_income, is_active) VALUES
('HDFC Regalia', 'HDFC Bank', '2500.00', '2500.00', 'Cashback & Points', '4% on Dining, 2% on Grocery', 'Monthly income ₹25,000+, Credit Score 750+', ARRAY['Airport Lounge Access', 'Travel Insurance', 'Dining Privileges'], 'https://example.com/hdfc-regalia', 'https://hdfcbank.com/apply-regalia', 'Travel', 750, '25000.00', true),

('ICICI Amazon Pay', 'ICICI Bank', '0.00', '0.00', 'Cashback', '5% on Amazon, 2% elsewhere', 'Monthly income ₹20,000+, Credit Score 700+', ARRAY['Amazon Prime Benefits', 'No Annual Fee', 'Instant Approval'], 'https://example.com/icici-amazon', 'https://icicibank.com/apply-amazon', 'Cashback', 700, '20000.00', true),

('SBI Simply Save', 'State Bank of India', '499.00', '499.00', 'Reward Points', '10% on Dining, 5% on Grocery', 'Monthly income ₹15,000+, Credit Score 650+', ARRAY['Dining Rewards', 'Fuel Surcharge Waiver', 'Movie Discounts'], 'https://example.com/sbi-simplysave', 'https://sbi.co.in/apply-simplysave', 'Dining', 650, '15000.00', true),

('Axis Magnus', 'Axis Bank', '12500.00', '12500.00', 'Miles & Points', '25 Edge Miles per ₹200', 'Monthly income ₹150,000+, Credit Score 800+', ARRAY['Priority Pass', 'Golf Benefits', 'Travel Credits', 'Concierge'], 'https://example.com/axis-magnus', 'https://axisbank.com/apply-magnus', 'Travel', 800, '150000.00', true),

('Kotak League Platinum', 'Kotak Bank', '999.00', '999.00', 'Reward Points', '6% on Movies, 4% on Dining', 'Monthly income ₹30,000+, Credit Score 720+', ARRAY['Movie Tickets', 'Dining Offers', 'Fuel Benefits'], 'https://example.com/kotak-league', 'https://kotakbank.com/apply-league', 'Entertainment', 720, '30000.00', true),

('HDFC Millennia', 'HDFC Bank', '1000.00', '1000.00', 'Cashback', '5% on Online Shopping, 2.5% elsewhere', 'Monthly income ₹25,000+, Credit Score 720+', ARRAY['Online Shopping Rewards', 'No Forex Markup', 'Instant Discounts'], 'https://example.com/hdfc-millennia', 'https://hdfcbank.com/apply-millennia', 'Cashback', 720, '25000.00', true),

('HDFC MoneyBack', 'HDFC Bank', '500.00', '500.00', 'Cashback', '20% on Utility Bills, 5% on Groceries', 'Monthly income ₹15,000+, Credit Score 650+', ARRAY['Utility Cashback', 'Grocery Rewards', 'Fuel Benefits'], 'https://example.com/hdfc-moneyback', 'https://hdfcbank.com/apply-moneyback', 'Cashback', 650, '15000.00', true),

('ICICI Platinum', 'ICICI Bank', '199.00', '199.00', 'Reward Points', '2% on Dining, 1% elsewhere', 'Monthly income ₹20,000+, Credit Score 680+', ARRAY['Dining Offers', 'Movie Discounts', 'Fuel Surcharge Waiver'], 'https://example.com/icici-platinum', 'https://icicibank.com/apply-platinum', 'Dining', 680, '20000.00', true),

('SBI Card PRIME', 'SBI Card', '2999.00', '2999.00', 'Reward Points', '5X on Dining, Entertainment', 'Monthly income ₹30,000+, Credit Score 700+', ARRAY['Movie Benefits', 'Dining Privileges', 'Fuel Surcharge Waiver'], 'https://example.com/sbi-prime', 'https://sbicard.com/apply-prime', 'Entertainment', 700, '30000.00', true),

('YES First Exclusive', 'YES Bank', '2999.00', '2999.00', 'Reward Points', '3% Universal Rewards', 'Monthly income ₹50,000+, Credit Score 750+', ARRAY['Priority Pass', 'Concierge Services', 'Travel Benefits'], 'https://example.com/yes-first', 'https://yesbank.in/apply-first', 'Premium', 750, '50000.00', true);

-- Verify the data was inserted
SELECT COUNT(*) as total_cards FROM credit_cards WHERE is_active = true;