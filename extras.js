/* Join reasoning (from the 20-question set), bug hunt (interview-style questions from every set), interview corner, function sheet, glossary. */
const J = (group, q, tables, join, joinText, steps, check, watch) => ({ group, q, tables, join, joinText, steps, check, watch });
const JOINQ = [
  J('Warm-up', 'List every film with the name of its language.', ['film', 'language'], 'INNER', 'INNER JOIN',
    ['One row of the answer: one film.', 'The title is in film. The language name is in language; film holds only language_id.', 'film.language_id matches language.language_id. One join.', 'Every film has a language, so nothing goes missing.'], '1,000 rows, one per film.'),
  J('Warm-up', 'List every rental with its rental date and the first and last name of the customer who rented it.', ['rental', 'customer'], 'INNER', 'INNER JOIN',
    ['One row: one rental.', 'The rental date is in rental. The names are in customer.', 'rental.customer_id matches customer.customer_id.', 'Every rental was made by a customer.'], '51,805 rows, one per rental.'),
  J('Warm-up', 'List every payment with its amount and the date of the rental it paid for.', ['payment', 'rental'], 'INNER', 'INNER JOIN',
    ['One row: one payment.', 'The amount is in payment. The rental date is in rental.', 'payment.rental_id matches rental.rental_id.', 'Every payment is for a rental.'], '51,061 rows, one per payment.', 'Two different dates. payment has its own payment_date, but the question asks for the date of the rental, which is why rental is needed.'),
  J('Longer paths', 'List every customer with the name of the city they live in.', ['customer', 'address', 'city'], 'INNER', 'INNER JOIN',
    ['One row: one customer.', 'The names are in customer. The city name is in city.', 'customer holds address_id, not city_id. The address holds the city: customer → address → city.', 'Every customer has an address and every address has a city.'], '999 rows, one per customer.', 'address. No column comes from it, but it is the only way from a customer to a city.'),
  J('Longer paths', 'List every film with the names of the genres it is filed under.', ['film', 'film_category', 'category'], 'INNER', 'INNER JOIN',
    ['One row: one film in one genre. A film in three genres appears three times.', 'The title is in film. The genre name is in category.', 'A film and a genre are linked through film_category, the bridge table.', 'Every film is filed under at least one genre.'], '2,367 rows, one per film per genre.', 'Step 1. The question says "every film", but the answer has more rows than there are films, because most films are in more than one genre.'),
  J('Longer paths', 'Which actors have appeared in films rated G?', ['actor', 'film_actor', 'film'], 'INNER', 'INNER JOIN',
    ['One row: one actor.', 'The names are in actor. The rating is in film.', 'actor → film_actor → film, through the bridge table.', 'Only actors who have a G film are wanted.'], '199 actors (with DISTINCT, since an actor in several G films matches several times).'),
  J('Longer paths', 'List every rental with the title of the film that was rented.', ['rental', 'inventory', 'film'], 'INNER', 'INNER JOIN',
    ['One row: one rental.', 'The title is in film.', 'A rental is of one physical copy, so rental holds inventory_id, not film_id. The copy holds the film: rental → inventory → film.', 'Every rental is of a copy, and every copy is of a film.'], '51,805 rows.', 'Looking for film_id in rental. It is not there. A rental points to a copy, and only the copy points to the film.'),
  J('Longer paths', 'What is the total payment amount for each film rating?', ['payment', 'rental', 'inventory', 'film'], 'INNER', 'INNER JOIN',
    ['One row: one rating.', 'The amount is in payment. The rating is in film.', 'A payment is for a rental, a rental is of a copy, a copy is of a film: payment → rental → inventory → film.', 'Only payments for a film are counted, and every payment is.'], '5 rows, one per rating.', 'The path is four tables long even though the answer has only two columns. Two of the tables are there only to connect the other two.'),
  J('Including the ones with none', 'Show every film with the number of copies in inventory, including films with no copies.', ['film', 'inventory'], 'LEFT', 'LEFT JOIN, starting from film',
    ['One row: one film.', 'The title is in film. Each copy is a row in inventory.', 'film.film_id matches inventory.film_id.', '"Including films with no copies" means a film with no match must stay. Start from film so every film is kept.'], '1,000 rows; 42 films show 0 copies.', 'Starting from inventory. Every row of inventory is a copy, so a film with no copies is not in it, and no join from there can bring it back.'),
  J('Including the ones with none', 'Show every customer with the number of rentals they have made. A customer who has never rented should show 0.', ['customer', 'rental'], 'LEFT', 'LEFT JOIN, starting from customer',
    ['One row: one customer.', 'The customer is in customer. Each rental is a row in rental.', 'customer.customer_id matches rental.customer_id.', '"Should show 0" means a customer with no rentals must stay, so start from customer.'], '999 rows; 2 customers show 0.'),
  J('Including the ones with none', 'List every rental with the amount paid for it. A rental with no payment should still appear, with the amount left blank.', ['rental', 'payment'], 'LEFT', 'LEFT JOIN, starting from rental',
    ['One row: one rental (but see the note).', 'The rental is in rental. The amount is in payment.', 'rental.rental_id matches payment.rental_id.', '"Should still appear" means a rental with no payment must stay. Its amount comes back empty, which is the blank the question asks for.'], '51,810 rows; 749 have a blank amount.', 'The word "usually" in the tables list: one payment, usually one per rental. A handful of rentals have two payments, and each of those rentals appears once per payment.'),
  J('Including the ones with none', 'Show every country with the number of customers who live there, including countries with no customers.', ['country', 'city', 'address', 'customer'], 'LEFT', 'LEFT JOIN at every step, starting from country',
    ['One row: one country.', 'The country name is in country. Each customer is a row in customer.', 'The customer path walked backwards: country → city → address → customer.', '"Including countries with no customers" means start from country and keep every country.'], '109 rows. One country, Australia, shows 0.', 'Making only the first join a LEFT JOIN. A country with no customers comes through the first LEFT JOIN with empty columns, and the next INNER JOIN drops it again because an empty column matches nothing. Once a path starts keeping rows, every join after it must keep them too.'),
  J('Finding what is missing', 'Which films have no actors listed?', ['film', 'film_actor'], 'ANTI', 'anti-join, starting from film',
    ['One row: one film.', 'The title is in film. Whether a film has actors is answered by film_actor.', 'film.film_id matches film_actor.film_id.', '"No actors" means exactly the films with no match: a LEFT JOIN from film, keeping only the rows where film_actor came back empty.'], '3 films.', 'actor. The question mentions actors, but the names are never shown. Whether a film has any actors is already settled by film_actor.'),
  J('Finding what is missing', 'Which customers have never rented anything?', ['customer', 'rental'], 'ANTI', 'anti-join, starting from customer',
    ['One row: one customer.', 'The names are in customer. Rentals are in rental.', 'customer.customer_id matches rental.customer_id.', '"Never" means only the customers with no match.'], '2 customers.'),
  J('Finding what is missing', 'Which rentals have no payment recorded?', ['rental', 'payment'], 'ANTI', 'anti-join, starting from rental',
    ['One row: one rental.', 'The rental is in rental. Payments are in payment.', 'rental.rental_id matches payment.rental_id.', '"No payment" means only the rentals with no match.'], '749 rentals.', 'The direction. Starting from payment finds payments with no rental, a different question; there are none.'),
  J('Finding what is missing', 'Which films are not stocked at any store?', ['film', 'inventory'], 'ANTI', 'anti-join, starting from film',
    ['One row: one film.', 'The title is in film. A copy at a store is a row in inventory.', 'film.film_id matches inventory.film_id.', '"Not stocked at any store" means the films with no copies at all.'], '42 films, the same 42 that show 0 copies above.', 'store. The question says "store", but inventory already holds store_id, and the question does not care which store. The store table is not needed.'),
  J('Mixed', 'How many copies of films does each store hold?', ['inventory'], 'NONE', 'no join',
    ['One row: one store.', 'Each copy is a row in inventory, and each row already holds its store_id.', 'Nothing to connect. Count the rows of inventory for each store_id.', 'No join.'], '2 rows, one for store 1 and one for store 2.', 'Reaching for store and film because the question mentions stores and films. Not every question needs a join. If every piece lives in one table, use one table.'),
  J('Mixed', 'Which actors have appeared in Horror films?', ['actor', 'film_actor', 'film_category', 'category'], 'INNER', 'INNER JOIN',
    ['One row: one actor.', 'The names are in actor. The genre name Horror is in category.', 'actor → film_actor gives each actor\'s films as film_id. film_category holds film_id too, so it joins straight to film_actor. Then film_category → category for the name.', 'Only actors who have a Horror film are wanted.'], '196 actors, each listed once.', 'film. The question says "films", but nothing from film is shown or filtered on. film_id is all that links an actor to a genre, and both bridge tables already have it. Including film still gives the right answer; it is one join more than you need (so it is accepted here too).'),
  J('Mixed', 'What is the total amount paid by customers in each country? Count a payment toward the country of the customer who made it.', ['payment', 'customer', 'address', 'city', 'country'], 'INNER', 'INNER JOIN',
    ['One row: one country.', 'The amount is in payment. The country name is in country.', 'payment holds customer_id itself, so it goes straight to customer, then along the customer path: customer → address → city → country.', 'Only countries with payments are asked for.'], '108 rows, one per country with customers.', 'Going through rental. payment → rental → customer also reaches a customer, but it is the customer on the rental, not the one who paid. They differ for 5 payments. "The customer who made it" means use the customer on the payment.'),
  J('Mixed', 'Which customers who live in Mexico have never rented anything?', ['customer', 'address', 'city', 'country', 'rental'], 'MIXED', 'INNER JOIN along customer → address → city → country, then an anti-join from customer to rental',
    ['One row: one customer.', 'The names are in customer. Mexico is in country. Rentals are in rental.', 'Two branches from customer: the customer path out to country, and customer to rental.', 'Two different questions, so two different joins. "Who live in Mexico" wants only customers with a match: inner. "Never rented" wants the customers with no match: anti-join.'], '2 customers, the same two as the never-rented question; both happen to live in Mexico.', 'Using one join type for the whole query. A question can ask for a match on one branch and no match on another. Pick the join for each branch separately.'),
];
JOINQ[17].optional = ['film']; // one join more than needed, still correct

const B = (set, q, bad, symptom, o, a, why, fix) => ({ set, q, bad, symptom, o, a, why, fix });
const BUGS = [
  B('single', 'Rentals that have not been returned.', `SELECT rental_id, rental_date, customer_id
FROM   rental
WHERE  return_date = NULL;`, 'Returns no rows. No error.',
    ['return_date has no NULLs', 'Comparing with NULL is unknown, not true, so WHERE keeps nothing', 'NULL must be quoted', 'The table needs an ORDER BY'], 1,
    'Nothing equals NULL, not even NULL. Test with IS NULL. 241 rentals are unreturned.', `SELECT rental_id, rental_date, customer_id
FROM   rental
WHERE  return_date IS NULL
ORDER BY rental_date, rental_id;`),
  B('single', 'Films rated G or PG that rent for $4.99.', `SELECT title, rating, rental_rate
FROM   film
WHERE  rating = 'G' OR rating = 'PG' AND rental_rate = 4.99;`, 'Returns films that do not rent for $4.99.',
    ['OR is not allowed with AND', 'AND binds tighter than OR, so it reads G OR (PG AND 4.99): every G film at any price', 'rental_rate must be in quotes', 'The rating column is case-sensitive'], 1,
    'Write the parentheses yourself, or use IN. Fixed: 123 rows.', `SELECT title, rating, rental_rate
FROM   film
WHERE  rating IN ('G', 'PG')
  AND  rental_rate = 4.99
ORDER BY rating, title;`),
  B('single', 'Films longer than three hours.', `SELECT title, length / 60.0 AS hours
FROM   film
WHERE  hours > 3;`, 'ERROR: column "hours" does not exist',
    ['Division is not allowed in SELECT', 'WHERE runs before SELECT, so the alias does not exist yet', 'hours is a reserved word', 'The alias needs AS in WHERE too'], 1,
    'Repeat the expression in WHERE. ORDER BY hours works, because ORDER BY runs after SELECT.', `SELECT   title, ROUND(length / 60.0, 2) AS hours
FROM     film
WHERE    length / 60.0 > 3
ORDER BY hours DESC, title;`),
  B('single', 'Products whose total units exceed 200.', `SELECT   product_id, SUM(units) AS total_units
FROM     lecture.order_items
WHERE    SUM(units) > 200
GROUP BY product_id;`, 'ERROR: aggregate functions are not allowed in WHERE',
    ['SUM needs DISTINCT', 'When WHERE runs there are no sums yet; a condition on a group goes in HAVING', 'units is text', 'GROUP BY must come before WHERE'], 1,
    'WHERE filters rows before grouping; HAVING filters groups after it.', `SELECT   product_id, SUM(units) AS total_units
FROM     lecture.order_items
GROUP BY product_id
HAVING   SUM(units) > 200
ORDER BY total_units DESC;`),
  B('single', 'How many addresses have a second line?', `SELECT COUNT(address2) AS with_second_line
FROM   address;`, 'Returns 999 of 1,003, but no address actually has a second line.',
    ['COUNT(col) counts NULLs', 'An empty string \'\' is a value, not NULL, and 999 rows store \'\'', 'address2 is the wrong column', 'COUNT needs *'], 1,
    'Turn the empty string into a real NULL with NULLIF, and COUNT then skips it: 0.', `SELECT COUNT(NULLIF(address2, '')) AS with_second_line
FROM   address;`),
  B('single', 'Regions with at least 25 orders.', `SELECT   region, COUNT(*) AS order_count
FROM     lecture.orders
GROUP BY region
HAVING   order_count >= 25;`, 'ERROR: column "order_count" does not exist',
    ['HAVING runs before SELECT, so the alias does not exist yet', 'HAVING cannot use COUNT', 'The alias has an underscore', 'GROUP BY must list order_count'], 0,
    'Repeat the aggregate in HAVING. Only ORDER BY, which runs after SELECT, can use the alias.', `SELECT   region, COUNT(*) AS order_count
FROM     lecture.orders
GROUP BY region
HAVING   COUNT(*) >= 25
ORDER BY order_count DESC;`),
  B('joins', 'Every customer with their 2025 rentals, including customers with none.', `SELECT   cu.customer_id, cu.first_name, cu.last_name,
         COUNT(r.rental_id) AS rentals_2025
FROM     customer cu
LEFT JOIN rental r ON r.customer_id = cu.customer_id
WHERE    r.rental_date >= '2025-01-01'
  AND    r.rental_date <  '2026-01-01'
GROUP BY cu.customer_id, cu.first_name, cu.last_name;`, 'Fewer rows than customers (955 of 999), and the smallest count is 1, never 0.',
    ['COUNT should be COUNT(*)', 'The WHERE on the right table drops the NULL rows the LEFT JOIN kept, turning it into an INNER JOIN', 'LEFT JOIN should be RIGHT JOIN', 'The dates need DATE in front'], 1,
    'A customer with no 2025 rental has NULL rental_date; the test is unknown; the row is thrown away. Move the date test into ON. Fixed: 999 rows, 44 with 0.', `SELECT   cu.customer_id, cu.first_name, cu.last_name,
         COUNT(r.rental_id) AS rentals_2025
FROM     customer cu
LEFT JOIN rental r ON r.customer_id = cu.customer_id
                  AND r.rental_date >= '2025-01-01'
                  AND r.rental_date <  '2026-01-01'
GROUP BY cu.customer_id, cu.first_name, cu.last_name
ORDER BY rentals_2025, cu.customer_id;`),
  B('joins', 'Copies of each film, including films with no copies.', `SELECT   f.title, COUNT(*) AS copies
FROM     film f
LEFT JOIN inventory i ON i.film_id = f.film_id
GROUP BY f.film_id, f.title
ORDER BY copies, f.title;`, 'No film shows 0 copies; 42 films show exactly 1.',
    ['The LEFT JOIN should be INNER', 'COUNT(*) counts the kept row full of NULLs as 1; count a column from the right table instead', 'GROUP BY needs only f.title', 'inventory has no film_id'], 1,
    'COUNT(i.inventory_id) skips the NULL and gives 0. The 42 "1 copy" films really have 0, and no film has exactly 1.', `SELECT   f.title, COUNT(i.inventory_id) AS copies
FROM     film f
LEFT JOIN inventory i ON i.film_id = f.film_id
GROUP BY f.film_id, f.title
ORDER BY copies, f.title;`),
  B('joins', 'Revenue by rating.', `SELECT   f.rating, SUM(p.amount) AS revenue
FROM     payment p
JOIN     rental r         ON r.rental_id = p.rental_id
JOIN     inventory i      ON i.inventory_id = r.inventory_id
JOIN     film f           ON f.film_id = i.film_id
JOIN     film_category fc ON fc.film_id = f.film_id
JOIN     category c       ON c.category_id = fc.category_id
GROUP BY f.rating;`, 'The five revenues add up to 405,100.72; payment holds 170,962.39.',
    ['SUM rounds up', 'film_category repeats each payment once per genre of its film, and rating does not need those tables', 'Some payments have no rental', 'GROUP BY should include c.name'], 1,
    'Join only the tables the question needs. Rating lives on film; drop film_category and category. Fixed total: 170,962.39.', `SELECT   f.rating, SUM(p.amount) AS revenue
FROM     payment p
JOIN     rental r    ON r.rental_id = p.rental_id
JOIN     inventory i ON i.inventory_id = r.inventory_id
JOIN     film f      ON f.film_id = i.film_id
GROUP BY f.rating
ORDER BY f.rating;`),
  B('joins', 'Different films rented and total rentals, per genre.', `SELECT   c.name AS category,
         COUNT(f.film_id)   AS films_rented,
         COUNT(r.rental_id) AS rentals
FROM     rental r
JOIN     inventory i      ON i.inventory_id = r.inventory_id
JOIN     film f           ON f.film_id = i.film_id
JOIN     film_category fc ON fc.film_id = f.film_id
JOIN     category c       ON c.category_id = fc.category_id
GROUP BY c.name;`, 'The two columns are identical on every row.',
    ['The join to film is missing', 'After the join one row is one rental, so COUNT(f.film_id) counts rentals too; use COUNT(DISTINCT f.film_id)', 'COUNT needs *', 'rental_id is NULL'], 1,
    'Count the thing you mean, with DISTINCT when it repeats. The rentals column adds to 122,666 against 51,805 rentals, because a rental of a film in three genres is counted once in each.', `SELECT   c.name AS category,
         COUNT(DISTINCT f.film_id) AS films_rented,
         COUNT(*)                  AS rentals
FROM     rental r
JOIN     inventory i      ON i.inventory_id = r.inventory_id
JOIN     film f           ON f.film_id = i.film_id
JOIN     film_category fc ON fc.film_id = f.film_id
JOIN     category c       ON c.category_id = fc.category_id
GROUP BY c.name
ORDER BY rentals DESC, category;`),
  B('joins', 'Films that have never been rented (a film with no copies counts).', `SELECT   f.film_id, f.title
FROM     film f
JOIN     inventory i ON i.film_id = f.film_id
LEFT JOIN rental r   ON r.inventory_id = i.inventory_id
WHERE    r.rental_id IS NULL;`, 'Returns 0 rows, so the colleague reported every film has been rented.',
    ['Every film really has been rented', 'The INNER JOIN to inventory drops films with no copies before the LEFT JOIN, and every existing copy has been rented', 'IS NULL should test i.inventory_id', 'rental has no inventory_id'], 1,
    'Both joins must be LEFT JOINs. The 42 never-rented films are exactly the 42 with no copies; copies_never_rented from inventory to rental is 0.', `SELECT   f.film_id, f.title
FROM     film f
LEFT JOIN inventory i ON i.film_id = f.film_id
LEFT JOIN rental r    ON r.inventory_id = i.inventory_id
WHERE    r.rental_id IS NULL
ORDER BY f.title;`),
  B('joins', 'Films that store 2 does not carry.', `SELECT   f.film_id, f.title
FROM     film f
LEFT JOIN inventory i ON i.film_id = f.film_id
WHERE    i.store_id = 2
  AND    i.inventory_id IS NULL;`, 'Returns 0 rows.',
    ['store_id is text', 'store_id = 2 and inventory_id IS NULL can never both be true on one row; the store test belongs in ON', 'LEFT JOIN should start from inventory', 'IS NULL needs = NULL'], 1,
    'In ON the store test decides which inventory rows may match, so a film stocked only at store 1 gets NULLs and survives. 238 rows.', `SELECT   f.film_id, f.title
FROM     film f
LEFT JOIN inventory i ON i.film_id = f.film_id
                     AND i.store_id = 2
WHERE    i.inventory_id IS NULL
ORDER BY f.title;`),
  B('joins', 'Average order value for 2025.', `SELECT SUM(p.amount) / COUNT(*) AS avg_order
FROM   orders AS o
JOIN   order_payments AS p ON p.order_id = o.order_id
WHERE  o.order_date >= '2025-01-01'
  AND  o.order_date <  '2026-01-01';`, '$103.63. The true average order value is $111.88. No error.',
    ['SUM skips NULLs', 'About 8% of orders have two payments, so COUNT(*) counts payments, not orders', 'The date range is wrong', 'Integer division'], 1,
    'The total is right; the denominator fanned out. Divide by COUNT(DISTINCT o.order_id). A believable number, 7% low: the fan-out that reaches a dashboard.', `SELECT SUM(p.amount) / COUNT(DISTINCT o.order_id) AS avg_order
FROM   orders AS o
JOIN   order_payments AS p ON p.order_id = o.order_id
WHERE  o.order_date >= '2025-01-01'
  AND  o.order_date <  '2026-01-01';`),
  B('shaping', 'Payment bands: Free, Under $3, $3 to $5.99, $6 and up.', `SELECT CASE
         WHEN amount < 6 THEN '$3 to $5.99'
         WHEN amount < 3 THEN 'Under $3'
         WHEN amount = 0 THEN 'Free'
         ELSE '$6 and up'
       END AS amount_band, COUNT(*) AS payments
FROM   payment
GROUP BY amount_band;`, 'Only two bands come back: "$3 to $5.99" and "$6 and up".',
    ['CASE allows at most two WHENs', 'First match wins: every amount under 3 is also under 6, so the first WHEN claims it', 'ELSE must come first', 'COUNT needs DISTINCT'], 1,
    'Order the WHENs from the most specific test to the least: = 0, then < 3, then < 6.', `SELECT CASE
         WHEN amount = 0 THEN 'Free'
         WHEN amount < 3 THEN 'Under $3'
         WHEN amount < 6 THEN '$3 to $5.99'
         ELSE '$6 and up'
       END AS amount_band, COUNT(*) AS payments
FROM   payment
GROUP BY amount_band
ORDER BY MIN(amount);`),
  B('shaping', 'Late returns per store.', `SELECT i.store_id,
       COUNT(*) AS returned,
       COUNT(CASE WHEN CAST(r.return_date AS date) - CAST(r.rental_date AS date)
                       > f.rental_duration THEN 1 ELSE 0 END) AS late
FROM   rental r
JOIN   inventory i ON i.inventory_id = r.inventory_id
JOIN   film f      ON f.film_id = i.film_id
WHERE  r.return_date IS NOT NULL
GROUP BY i.store_id;`, 'late equals returned on every row.',
    ['The comparison is always true', 'COUNT counts every non-NULL value, and 0 is not NULL, so ELSE 0 makes every row count', 'CAST is wrong', 'rental_duration is NULL'], 1,
    'Drop the ELSE so misses become NULL, or keep ELSE 0 and use SUM. Fixed: 11,250 and 11,302.', `SELECT i.store_id,
       COUNT(*) AS returned,
       SUM(CASE WHEN CAST(r.return_date AS date) - CAST(r.rental_date AS date)
                     > f.rental_duration THEN 1 ELSE 0 END) AS late
FROM   rental r
JOIN   inventory i ON i.inventory_id = r.inventory_id
JOIN   film f      ON f.film_id = i.film_id
WHERE  r.return_date IS NOT NULL
GROUP BY i.store_id;`),
  B('shaping', 'Share of rentals never returned, per store.', `SELECT i.store_id,
       COUNT(*) AS rentals,
       COUNT(*) - COUNT(r.return_date) AS not_returned,
       ROUND(100 * (COUNT(*) - COUNT(r.return_date)) / COUNT(*), 2) AS pct_not_returned
FROM   rental r
JOIN   inventory i ON i.inventory_id = r.inventory_id
GROUP BY i.store_id;`, 'pct_not_returned is 0.00 for both stores.',
    ['ROUND to 2 decimals rounds down', 'Every value is an integer, so the division is integer division and the remainder is dropped', 'The subtraction is wrong', 'COUNT(r.return_date) is always 0'], 1,
    'CAST one side to numeric before dividing, or multiply by 100.0. Fixed: 0.49 and 0.44.', `SELECT i.store_id,
       COUNT(*) AS rentals,
       COUNT(*) - COUNT(r.return_date) AS not_returned,
       ROUND(100 * CAST(COUNT(*) - COUNT(r.return_date) AS numeric) / COUNT(*), 2) AS pct_not_returned
FROM   rental r
JOIN   inventory i ON i.inventory_id = r.inventory_id
GROUP BY i.store_id;`),
  B('shaping', 'March 2025 payments.', `SELECT COUNT(*) AS payments, SUM(amount) AS revenue
FROM   payment
WHERE  payment_date BETWEEN '2025-03-01' AND '2025-03-31';`, '728 payments. The true count is 751.',
    ['BETWEEN excludes both ends', 'payment_date is a timestamp, so \'2025-03-31\' means midnight at the start of that day and all of 31 March is left out', 'March has 30 days', 'The dates must be cast'], 1,
    'Use >= start AND < next start. BETWEEN is safe only on a column of plain dates.', `SELECT COUNT(*) AS payments, SUM(amount) AS revenue
FROM   payment
WHERE  payment_date >= '2025-03-01'
  AND  payment_date <  '2025-04-01';`),
  B('shaping', 'Customer 780\'s rentals, with "Not returned" where there is no return date.', `SELECT rental_id,
       COALESCE(return_date, 'Not returned') AS returned_on
FROM   rental
WHERE  customer_id = 780;`, 'ERROR: invalid input syntax for type date: "Not returned"',
    ['COALESCE takes exactly two numbers', 'All COALESCE arguments must be one type; the first is a date, so the text is read as a date', 'return_date is never NULL', 'The string needs double quotes'], 1,
    'CAST the date to text first; then both arguments are text.', `SELECT rental_id,
       COALESCE(CAST(CAST(return_date AS date) AS text), 'Not returned') AS returned_on
FROM   rental
WHERE  customer_id = 780
ORDER BY rental_date, rental_id;`),
  B('shaping', 'Share of each customer\'s orders placed in March, for every customer.', `SELECT c.customer_id,
       ROUND(100 * CAST(COUNT(CASE WHEN o.order_date >= '2026-03-01' THEN 1 END) AS numeric)
             / COUNT(o.order_id), 1) AS march_pct
FROM   lecture.customers AS c
LEFT JOIN lecture.orders AS o ON o.customer_id = c.customer_id
GROUP BY c.customer_id;`, 'ERROR: division by zero',
    ['CAST cannot be used inside ROUND', 'Two customers have no orders, so COUNT(o.order_id) is 0 for them; divide by NULLIF(…, 0)', 'COUNT(CASE …) is not allowed', 'LEFT JOIN should be INNER'], 1,
    'NULLIF turns the 0 into NULL and division by NULL gives NULL, not an error. A share of no orders does not exist, so NULL is the honest answer.', `SELECT c.customer_id,
       ROUND(100 * CAST(COUNT(CASE WHEN o.order_date >= '2026-03-01' THEN 1 END) AS numeric)
             / NULLIF(COUNT(o.order_id), 0), 1) AS march_pct
FROM   lecture.customers AS c
LEFT JOIN lecture.orders AS o ON o.customer_id = c.customer_id
GROUP BY c.customer_id;`),
  B('multi', 'The two most expensive films to rent in each genre.', `SELECT   c.name AS category, f.title, f.rental_rate,
         ROW_NUMBER() OVER (PARTITION BY c.name
                            ORDER BY f.rental_rate DESC, f.title) AS rn
FROM     film          AS f
JOIN     film_category AS fc ON fc.film_id    = f.film_id
JOIN     category      AS c  ON c.category_id = fc.category_id
WHERE    rn <= 2
ORDER BY category, rn;`, 'ERROR: column "rn" does not exist',
    ['ROW_NUMBER needs an argument', 'WHERE runs before window functions, so rn has not been computed yet', 'PARTITION BY must match GROUP BY', 'rn is reserved'], 1,
    'Put the numbering in a WITH step, which finishes it, and filter in the query after.', `WITH ranked AS (
  SELECT   c.name AS category, f.title, f.rental_rate,
           ROW_NUMBER() OVER (PARTITION BY c.name
                              ORDER BY f.rental_rate DESC, f.title) AS rn
  FROM     film          AS f
  JOIN     film_category AS fc ON fc.film_id    = f.film_id
  JOIN     category      AS c  ON c.category_id = fc.category_id
)
SELECT   category, title, rental_rate
FROM     ranked
WHERE    rn <= 2
ORDER BY category, rn;`),
  B('multi', 'The second-longest film in each genre.', `WITH ranked AS (
  SELECT c.name AS category, f.title, f.length,
         ROW_NUMBER() OVER (PARTITION BY c.name ORDER BY f.length DESC) AS rn
  FROM   film f
  JOIN   film_category fc ON fc.film_id = f.film_id
  JOIN   category c       ON c.category_id = fc.category_id
)
SELECT category, title, length FROM ranked WHERE rn = 2;`, 'In Action it returns THEORY MERMAID at 184 minutes, which is the longest length in the genre.',
    ['The sort should be ASC', 'Two films tie at 184; ROW_NUMBER numbers one of them 2. DENSE_RANK = 2 is the second-longest length', 'PARTITION BY is wrong', 'LENGTH is ambiguous'], 1,
    'DENSE_RANK gives tied films the same rank with no gap. RANK would be wrong the other way, skipping 2 after the tie.', `WITH ranked AS (
  SELECT c.name AS category, f.title, f.length,
         DENSE_RANK() OVER (PARTITION BY c.name ORDER BY f.length DESC) AS length_rank
  FROM   film f
  JOIN   film_category fc ON fc.film_id = f.film_id
  JOIN   category c       ON c.category_id = fc.category_id
)
SELECT category, title, length
FROM   ranked
WHERE  length_rank = 2
ORDER BY category, title;`),
  B('multi', 'March, April and May 2025 with the change from the month before.', `WITH monthly AS (
  SELECT CAST(DATE_TRUNC('month', rental_date) AS date) AS month, COUNT(*) AS rentals
  FROM   rental
  WHERE  rental_date >= '2025-03-01' AND rental_date < '2025-06-01'
  GROUP BY month
)
SELECT month, rentals, LAG(rentals) OVER (ORDER BY month) AS prev_rentals
FROM   monthly;`, 'March\'s previous month is blank.',
    ['LAG needs an offset of 2', 'The WHERE removed February before LAG ran; windows only see rows that survive the filter', 'DATE_TRUNC drops the first month', 'ORDER BY month is missing'], 1,
    'Compute every month and the LAG in CTEs, then keep March to May in the outer query.', `WITH monthly AS (
  SELECT CAST(DATE_TRUNC('month', rental_date) AS date) AS month, COUNT(*) AS rentals
  FROM   rental
  WHERE  rental_date >= '2025-01-01' AND rental_date < '2026-01-01'
  GROUP BY month
),
with_prev AS (
  SELECT month, rentals, LAG(rentals) OVER (ORDER BY month) AS prev_rentals
  FROM   monthly
)
SELECT month, rentals, prev_rentals, rentals - prev_rentals AS change
FROM   with_prev
WHERE  month >= '2025-03-01' AND month < '2025-06-01'
ORDER BY month;`),
  B('multi', 'Revenue by rating with each rating\'s share of the total.', `SELECT   f.rating,
         SUM(p.amount) AS revenue,
         ROUND(100 * SUM(p.amount) / SUM(p.amount) OVER (), 1) AS pct_of_total
FROM     payment   AS p
JOIN     rental    AS r ON r.rental_id    = p.rental_id
JOIN     inventory AS i ON i.inventory_id = r.inventory_id
JOIN     film      AS f ON f.film_id      = i.film_id
GROUP BY f.rating;`, 'ERROR: column "p.amount" must appear in the GROUP BY clause or be used in an aggregate function',
    ['Windows cannot be used with joins', 'Windows run after GROUP BY, when the rows are one per rating and p.amount is gone', 'ROUND cannot take a window', 'The alias revenue should be used'], 1,
    'Group in a WITH step, then run the window over its five rows. (SUM(SUM(p.amount)) OVER () also works and is harder to read.)', `WITH by_rating AS (
  SELECT   f.rating, SUM(p.amount) AS revenue
  FROM     payment   AS p
  JOIN     rental    AS r ON r.rental_id    = p.rental_id
  JOIN     inventory AS i ON i.inventory_id = r.inventory_id
  JOIN     film      AS f ON f.film_id      = i.film_id
  GROUP BY f.rating
)
SELECT   rating, revenue,
         ROUND(100 * revenue / SUM(revenue) OVER (), 1) AS pct_of_total
FROM     by_rating
ORDER BY rating;`),
  B('multi', 'Month-over-month rentals over the whole history.', `WITH monthly AS (
  SELECT CAST(DATE_TRUNC('month', rental_date) AS date) AS month, COUNT(*) AS rentals
  FROM   rental
  GROUP BY month
)
SELECT month, rentals,
       LAG(month)   OVER (ORDER BY month) AS prev_month,
       LAG(rentals) OVER (ORDER BY month) AS prev_rentals
FROM   monthly;`, 'May 2022 shows a "previous month" of February 2022.',
    ['LAG is unordered', 'Nothing was rented in March or April 2022, so those months have no row; LAG reads the previous row, not the previous month', 'DATE_TRUNC is wrong for 2022', 'The CTE needs an ORDER BY'], 1,
    'For months that may be missing, start from a calendar table with a LEFT JOIN so every month has a row, 0 when empty. reelhouse has no calendar; the lab\'s northgate does.', `-- With a calendar table (northgate):
WITH months AS (
  SELECT DISTINCT CAST(DATE_TRUNC('month', calendar_date) AS date) AS month
  FROM   calendar
),
monthly AS (
  SELECT m.month, COUNT(o.order_id) AS orders
  FROM   months m
  LEFT JOIN orders o ON CAST(DATE_TRUNC('month', o.order_date) AS date) = m.month
  GROUP BY m.month
)
SELECT month, orders, LAG(orders) OVER (ORDER BY month) AS prev_orders
FROM   monthly
ORDER BY month;`),
  B('multi', 'Seven-day moving average of daily revenue in March.', `WITH daily AS (
  SELECT o.order_date, SUM(oi.units * p.unit_price) AS revenue
  FROM   lecture.orders o
  JOIN   lecture.order_items oi ON oi.order_id = o.order_id
  JOIN   lecture.products p     ON p.product_id = oi.product_id
  WHERE  o.order_date >= '2026-03-01'
  GROUP BY o.order_date
)
SELECT order_date, revenue,
       AVG(revenue) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg_7
FROM   daily;`, 'The shop is closed on 8 March. The value for 9 March averages seven rows that span eight days.',
    ['The frame should be 7 PRECEDING', 'A frame counts rows, and closed days have no row; start from the calendar so every day is a row, 0 when closed', 'AVG ignores the frame', 'ORDER BY must be DESC'], 1,
    'Seven rows are seven days only if every day has a row. Start from the calendar with a LEFT JOIN and COALESCE the revenue to 0.', `WITH daily AS (
  SELECT cal.calendar_date, COALESCE(SUM(oi.units * p.unit_price), 0) AS revenue
  FROM   calendar cal
  LEFT JOIN lecture.orders o       ON o.order_date = cal.calendar_date
  LEFT JOIN lecture.order_items oi ON oi.order_id = o.order_id
  LEFT JOIN lecture.products p     ON p.product_id = oi.product_id
  WHERE  cal.calendar_date >= '2026-03-01' AND cal.calendar_date < '2026-04-01'
  GROUP BY cal.calendar_date
)
SELECT calendar_date, revenue,
       ROUND(AVG(revenue) OVER (ORDER BY calendar_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS avg_7
FROM   daily
ORDER BY calendar_date;`),
];

const INTERVIEW = [
  { u: 'single', q: 'What is the difference between WHERE and HAVING?', a: 'WHERE filters rows before grouping; HAVING filters groups after aggregation. A test on a count or a sum can only live in HAVING, because the count does not exist until the rows are grouped.' },
  { u: 'single', q: 'What is the difference between COUNT(*), COUNT(col), and COUNT(DISTINCT col)?', a: 'COUNT(*) counts rows; COUNT(col) counts rows where col is not NULL; COUNT(DISTINCT col) counts the different non-NULL values of col.' },
  { u: 'single', q: 'Why does WHERE col = NULL return nothing?', a: 'Any comparison with NULL is unknown rather than true, and WHERE keeps only rows that are true. Use IS NULL or IS NOT NULL.' },
  { u: 'single', q: "Why can't I use a column alias in WHERE?", a: 'Aliases are created at SELECT, and WHERE runs before SELECT. ORDER BY runs after SELECT and can use them. Repeat the expression in WHERE (or HAVING).' },
  { u: 'single', q: 'Find the top 5 products by units sold.', a: 'Group order_items by product, sum the units, sort the sum descending with a tie-breaker, and LIMIT 5. LIMIT without ORDER BY is not "top".', sql: `SELECT   product_id, SUM(units) AS total_units
FROM     lecture.order_items
GROUP BY product_id
ORDER BY total_units DESC, product_id
LIMIT    5;` },
  { u: 'joins', q: 'What is the difference between an INNER JOIN and a LEFT JOIN?', a: 'An INNER JOIN keeps only rows that have a match on both sides. A LEFT JOIN keeps every row of the left table, with NULLs in the right table\'s columns where nothing matched.' },
  { u: 'joins', q: 'Find the customers who have never placed an order.', a: 'An anti-join: LEFT JOIN customers to orders and keep the rows where the order key is NULL.', sql: `SELECT   c.customer_id, c.first_name
FROM     lecture.customers AS c
LEFT JOIN lecture.orders   AS o ON o.customer_id = c.customer_id
WHERE    o.order_id IS NULL;` },
  { u: 'joins', q: 'Why did my LEFT JOIN return the same rows as an INNER JOIN?', a: 'A WHERE condition tests a column of the right-hand table. For the unmatched rows that column is NULL, the test is unknown, and the row is dropped. Move that condition into ON.' },
  { u: 'joins', q: 'My order count doubled after I added a join. Why?', a: 'Fan-out: the table you joined has several rows per order (line items, payments), so each order now repeats once per match and COUNT(*) counts the repeats. Count with COUNT(DISTINCT order_id), or aggregate each thing at its own granularity.' },
  { u: 'joins', q: 'Total revenue by customer, from customers, orders, order items and products.', a: 'Walk the foreign keys customers → orders → order_items → products, multiply units by price on each line, sum per customer.', sql: `SELECT   c.customer_id, c.first_name, c.last_name,
         SUM(oi.units * p.unit_price) AS revenue
FROM     lecture.customers   AS c
JOIN     lecture.orders      AS o  ON o.customer_id = c.customer_id
JOIN     lecture.order_items AS oi ON oi.order_id   = o.order_id
JOIN     lecture.products    AS p  ON p.product_id  = oi.product_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY revenue DESC;` },
  { u: 'shaping', q: 'Show revenue by region, with a column for each category.', a: 'Conditional aggregation: GROUP BY region makes the rows, and a SUM(CASE WHEN category = … THEN revenue ELSE 0 END) makes each column.', sql: `SELECT o.region,
  SUM(CASE WHEN p.category = 'Beverages' THEN oi.units * p.unit_price ELSE 0 END) AS beverages,
  SUM(CASE WHEN p.category = 'Bakery'    THEN oi.units * p.unit_price ELSE 0 END) AS bakery,
  SUM(oi.units * p.unit_price) AS total
FROM   lecture.orders o
JOIN   lecture.order_items oi ON oi.order_id = o.order_id
JOIN   lecture.products p     ON p.product_id = oi.product_id
GROUP BY o.region;` },
  { u: 'shaping', q: 'Does AVG include NULL values?', a: 'No. AVG, like SUM, MIN, MAX and COUNT(col), skips NULLs and divides by the values present. If a NULL should count as zero, wrap it in COALESCE(x, 0) first.' },
  { u: 'shaping', q: 'How do you avoid a divide-by-zero error?', a: 'Divide by NULLIF(denominator, 0). NULLIF returns NULL when the denominator is 0, and dividing by NULL gives NULL instead of an error.' },
  { u: 'shaping', q: 'Why does 7 / 2 return 3?', a: 'Both operands are integers, so the division is integer division and the fraction is thrown away. Cast one side to numeric, or write 7 / 2.0.' },
  { u: 'shaping', q: "Why is my March count low with BETWEEN '2026-03-01' AND '2026-03-31'?", a: 'The column is a timestamp. A date written against a timestamp means midnight, so the range ends at the start of 31 March and the whole day is lost. Use >= \'2026-03-01\' AND < \'2026-04-01\'.' },
  { u: 'shaping', q: 'Show orders for every day, including days with none.', a: 'Start from a calendar table, LEFT JOIN the orders to it on the date, and COUNT a column from orders so the empty days show 0.', sql: `SELECT   cal.calendar_date, COUNT(o.order_id) AS orders
FROM     calendar AS cal
LEFT JOIN lecture.orders AS o ON o.order_date = cal.calendar_date
WHERE    cal.calendar_date >= '2026-01-01' AND cal.calendar_date < '2026-04-01'
GROUP BY cal.calendar_date
ORDER BY cal.calendar_date;` },
  { u: 'multi', q: 'What is the difference between GROUP BY and a window function?', a: 'GROUP BY collapses the rows to one per group. A window function computes over a set of rows but keeps every row, writing the result beside each one.' },
  { u: 'multi', q: 'ROW_NUMBER, RANK, DENSE_RANK: what happens on a tie?', a: 'ROW_NUMBER still gives different numbers (1 2 3 4 5). RANK shares the place and skips the next (1 2 2 4 4). DENSE_RANK shares the place with no gap (1 2 2 3 3).' },
  { u: 'multi', q: 'Show the top three products in each category.', a: 'Aggregate per category and product in a CTE; ROW_NUMBER() OVER (PARTITION BY category ORDER BY value DESC) in a second CTE; WHERE rn <= 3 outside.', sql: `WITH units_per_product AS (
  SELECT p.category, p.product_name, SUM(oi.units) AS units
  FROM   lecture.order_items oi
  JOIN   lecture.products p ON p.product_id = oi.product_id
  GROUP BY p.category, p.product_name
),
ranked AS (
  SELECT category, product_name, units,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC) AS rn
  FROM   units_per_product
)
SELECT category, product_name, units, rn
FROM   ranked
WHERE  rn <= 3
ORDER BY category, rn;` },
  { u: 'multi', q: 'Why does WHERE row_num <= 3 fail, and how do you fix it?', a: 'WHERE runs before window functions, so row_num does not exist yet. Compute the window in a CTE and filter in the query after it.' },
  { u: 'multi', q: "Show each month's revenue with its change from the month before.", a: 'Monthly totals in a CTE; LAG(revenue) OVER (ORDER BY month) in a second; revenue minus prev, and the percent with NULLIF, in the outer query. January\'s change is NULL, correctly.', sql: `WITH monthly AS (
  SELECT CAST(DATE_TRUNC('month', o.order_date) AS date) AS month,
         SUM(oi.units * p.unit_price) AS revenue
  FROM   lecture.orders o
  JOIN   lecture.order_items oi ON oi.order_id = o.order_id
  JOIN   lecture.products p     ON p.product_id = oi.product_id
  GROUP BY month
),
with_prev AS (
  SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev_month
  FROM   monthly
)
SELECT month, revenue, prev_month,
       revenue - prev_month AS change,
       ROUND(100 * (revenue - prev_month) / NULLIF(prev_month, 0), 1) AS pct_change
FROM   with_prev
ORDER BY month;` },
  { u: 'multi', q: 'What is wrong with a seven-row moving average of daily sales?', a: 'A frame counts rows, not days. If some days have no row, seven rows span more than seven days. Start from a calendar so every day has a row, worth 0 when there were no sales.' },
];

const CHEAT = [
  ['Clauses, in the order they run', [
    ['FROM … JOIN … ON …', 'Finds the tables and matches rows. JOIN alone means INNER JOIN.', 'Alias every table and prefix every column.'],
    ['WHERE', 'Keeps rows. Runs before grouping.', 'Cannot see aliases or aggregates. On a LEFT JOIN, a test on the right table here drops the unmatched rows.'],
    ['GROUP BY', 'Makes one row per distinct value. Sets the granularity.', 'Every SELECT column must be grouped or aggregated. PostgreSQL accepts an alias here.'],
    ['HAVING', 'Keeps groups. Runs after grouping.', 'Cannot see aliases: repeat the aggregate.'],
    ['window functions', 'Run after HAVING, before SELECT.', 'WHERE cannot filter on them; use a CTE.'],
    ['SELECT … AS alias', 'Picks and computes columns, names the aliases.', 'Nothing is stored.'],
    ['DISTINCT', 'Removes duplicate result rows.', 'Applies to the whole row.'],
    ['ORDER BY … DESC, tiebreak', 'Sorts. Can use aliases.', 'No ORDER BY, no guaranteed order. NULLs come first in DESC; use NULLS LAST.'],
    ['LIMIT n', 'Cuts to n rows.', 'Without ORDER BY it is some rows, not the top.'],
    ['WITH name AS (…), name2 AS (…)', 'Names a step; later steps and the final SELECT read it like a table.', 'Commas between steps; a step sees only the steps above it.'],
  ]],
  ['Filtering', [
    ['= <> < <= > >=', 'Comparison. Text and dates in single quotes.', 'Text is case-sensitive. Anything compared with NULL is unknown.'],
    ['AND, OR, parentheses', 'Combine conditions.', 'AND binds before OR. Write the parentheses yourself.'],
    ['IN (a, b, c)', 'True if the value is any of the list.', 'NOT IN for the rest.'],
    ['BETWEEN low AND high', 'Range including both ends.', 'Low first. On timestamps use >= start AND < next start instead.'],
    ['LIKE / ILIKE \'%x_\'', 'Pattern match; % any run, _ one character; ILIKE ignores case.', 'LIKE \'%love%\' finds nothing in capitals-only data.'],
    ['IS NULL / IS NOT NULL', 'The only test for missing values.', '= NULL keeps nothing. \'\' is not NULL.'],
    ['(SELECT one_value FROM …)', 'Scalar subquery: one row, one column, used where a number goes.', 'Runs first.'],
  ]],
  ['Aggregates (collapse rows; skip NULLs)', [
    ['COUNT(*)', 'Rows.', 'After a LEFT JOIN counts the kept NULL row as 1.'],
    ['COUNT(col)', 'Rows where col is not NULL.', 'Counts \'\' and 0.'],
    ['COUNT(DISTINCT col)', 'Different non-NULL values.', 'Use after a join that fans out.'],
    ['SUM, AVG, MIN, MAX', 'Total, mean, smallest, largest of the non-NULL values.', 'AVG divides by values present, not rows. SUM of nothing is NULL.'],
    ['ROUND(x, n)', 'Rounds to n decimals (0 if omitted).', 'Round only where asked.'],
    ['COUNT(CASE WHEN c THEN 1 END)', 'Counts rows where c is true.', 'No ELSE, or every row counts. With ELSE 0 use SUM.'],
    ['SUM(CASE WHEN c THEN x ELSE 0 END)', 'Adds x only for rows where c is true: one report column per condition.', 'The manual pivot.'],
  ]],
  ['Shaping values', [
    ['CASE WHEN c1 THEN v1 WHEN c2 THEN v2 ELSE v END', 'One value per row; first true WHEN wins.', 'Most specific first. Always write ELSE.'],
    ['COALESCE(a, b, …)', 'First argument that is not NULL.', 'All arguments one type. Use only when the replacement is true.'],
    ['NULLIF(a, b)', 'NULL if a = b, else a.', 'Safe division: x / NULLIF(y, 0). Empty strings: NULLIF(s, \'\').'],
    ['CAST(x AS type) or x::type', 'Changes the type, not the meaning.', 'CAST(int AS numeric) before dividing. CAST(timestamp AS date) for the day. CAST(date AS text) before COALESCE with text.'],
    ['a + NULL, a || NULL', 'NULL. NULL spreads through arithmetic.', 'COALESCE first if it should be 0.'],
  ]],
  ['Dates', [
    ['DATE \'2026-03-31\'', 'A date literal; makes date math work.', 'Text minus text fails.'],
    ['>= \'start\' AND < \'next start\'', 'A range that works for dates and timestamps.', 'The default habit.'],
    ['DATE_TRUNC(\'month\', d)', 'Start of d\'s week, month, quarter or year, as a timestamp.', 'CAST(... AS date) to show a date.'],
    ['EXTRACT(part FROM d)', 'One number: YEAR, MONTH, DAY, QUARTER, HOUR, DOW.', 'DOW: 0 Sunday … 6 Saturday.'],
    ['date − date', 'Whole number of calendar days.', 'Counts dates apart, not 24-hour periods.'],
    ['timestamp − timestamp', 'An interval, exact to the second.', 'CAST both to date for days.'],
    ['date + 30, date + INTERVAL \'1 month\'', 'A date 30 days later; a timestamp a month later.', ''],
    ['SET TIME ZONE \'UTC\'; TIMESTAMPTZ \'…+00\'', 'Pin the session or the literal to a zone.', 'Counts by hour and month shift with the zone otherwise.'],
    ['calendar LEFT JOIN facts', 'One row per day, including days with none.', 'COUNT a column from the right; closed days show 0.'],
  ]],
  ['Window functions (keep rows)', [
    ['agg(x) OVER ()', 'The aggregate over all rows, on every row.', 'Group first in a CTE, window second.'],
    ['agg(x) OVER (PARTITION BY g)', 'The aggregate per group, on every row.', 'GROUP BY for a window.'],
    ['ROW_NUMBER() OVER (ORDER BY …)', '1, 2, 3 with no repeats.', 'Add a tie-breaker. Use for exactly N or one per group.'],
    ['RANK() OVER (ORDER BY …)', 'Ties share, next place skipped: 1 2 2 4.', ''],
    ['DENSE_RANK() OVER (ORDER BY …)', 'Ties share, no gap: 1 2 2 3.', '"Second highest value".'],
    ['LAG(x) / LEAD(x) OVER (ORDER BY …)', 'Previous / next row\'s x on this row. LAG(x, 12) for 12 rows back.', 'Reads rows, not months; first LAG is NULL.'],
    ['SUM(x) OVER (ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)', 'Running total.', 'Write the frame out.'],
    ['AVG(x) OVER (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)', 'Seven-row moving average.', 'Seven rows are seven days only if every day has a row.'],
    ['WITH ranked AS (… window …) SELECT … WHERE rn <= N', 'Filter on a window.', 'Never in the same query that computes it.'],
  ]],
];

const GLOSSARY = [
  ['Aggregate function', 'COUNT, SUM, AVG, MIN, MAX: many rows in, one value out. All skip NULLs except COUNT(*).', 'single'],
  ['Alias', 'A short name for a column (AS new_price) or table (products AS p). Column aliases exist from SELECT on, so ORDER BY sees them and WHERE/HAVING do not.', 'single'],
  ['Ambiguous column', 'A column name present in two joined tables with no alias to say which. An error; prefix every column.', 'joins'],
  ['Anti-join', 'LEFT JOIN followed by WHERE right_key IS NULL: the left rows with no match. "Never", "no", "without", "missing".', 'joins'],
  ['BETWEEN', 'Inclusive range, low first. Safe on dates; on timestamps the upper date means midnight, so use < next start.', 'single'],
  ['Bridge table', 'A table of pairs (film_actor, film_category) with a two-column key, storing a many-to-many relationship.', 'joins'],
  ['Calendar table', 'One row per day. LEFT JOIN facts to it so days with nothing still appear, as 0.', 'shaping'],
  ['CASE', 'If-then-else as an expression: WHEN tests in order, first true wins, ELSE for the rest.', 'shaping'],
  ['CAST', 'Converts a value to another type: CAST(x AS numeric), x::date. Changes the query output, not the table.', 'shaping'],
  ['COALESCE', 'The first non-NULL argument. All arguments must share a type.', 'shaping'],
  ['Composite key', 'A key made of two or more columns. A join on it needs every column in ON, joined with AND.', 'joins'],
  ['Conditional aggregation', 'A CASE inside SUM or COUNT, one per condition, to turn rows into columns. The manual pivot.', 'shaping'],
  ['COUNT(DISTINCT col)', 'The number of different non-NULL values. The right count after a join that fans out.', 'single'],
  ['CTE (common table expression)', 'WITH name AS (query): a named step that the rest of the statement reads like a table. Nothing is saved.', 'multi'],
  ['DATE_TRUNC', 'Rolls a date or timestamp back to the start of its week, month, quarter or year. Returns a timestamp; cast to date.', 'shaping'],
  ['DENSE_RANK', 'Ranking where ties share a place and no place is skipped: 1, 2, 2, 3. "The second-highest value".', 'multi'],
  ['DISTINCT', 'Removes duplicate rows from the result. Applies to the whole row.', 'single'],
  ['DOW', 'Day of week from EXTRACT: 0 Sunday through 6 Saturday.', 'shaping'],
  ['EXTRACT', 'Pulls one numeric part from a date or timestamp: YEAR, MONTH, DAY, QUARTER, HOUR, DOW.', 'shaping'],
  ['Fan-out', 'A join to a table with several rows per key repeats each left row once per match. Counts and sums over the result inflate unless aggregated at their own granularity.', 'joins'],
  ['Foreign key', 'A column that holds another table\'s key (orders.customer_id). The line the ERD draws; the thing ON matches.', 'joins'],
  ['Frame', 'ROWS BETWEEN start AND end inside OVER: which rows an aggregate window covers for each row. Counts rows, not days.', 'multi'],
  ['FULL JOIN', 'Keeps every row of both tables, NULLs where either side is unmatched. For reconciling two lists.', 'joins'],
  ['Granularity', 'What one row of a table or result is. A join takes the finest granularity on its path; GROUP BY sets the result\'s.', 'joins'],
  ['GROUP BY', 'Splits rows into groups by the listed columns; each aggregate runs once per group. One row per distinct value.', 'single'],
  ['Half-open range', '>= start AND < next start. Right for dates and timestamps alike.', 'shaping'],
  ['HAVING', 'Filters groups after aggregation. Where a condition on COUNT or SUM lives.', 'single'],
  ['ILIKE', 'Case-insensitive LIKE (PostgreSQL).', 'single'],
  ['IN', 'True if the value is in the list. Shorthand for a chain of ORs without the precedence trap.', 'single'],
  ['INNER JOIN', 'Keeps rows with a match on both sides. JOIN alone means this.', 'joins'],
  ['Integer division', 'An integer divided by an integer is an integer; the fraction is dropped. Cast one side to numeric or multiply by 100.0.', 'shaping'],
  ['Interval', 'The result of timestamp minus timestamp: days, hours, minutes, seconds.', 'shaping'],
  ['LAG / LEAD', 'Window functions that copy the previous / next row\'s value onto this row, in the OVER (ORDER BY) order.', 'multi'],
  ['LEFT JOIN', 'Keeps every row of the left table; right columns are NULL where nothing matched. Start from the table whose rows must all appear.', 'joins'],
  ['LIKE', 'Case-sensitive pattern match. % any run of characters, _ exactly one.', 'single'],
  ['LIMIT', 'Cuts the result to n rows. Meaningful only with ORDER BY.', 'single'],
  ['Moving average', 'AVG over a frame such as ROWS BETWEEN 6 PRECEDING AND CURRENT ROW. Needs a row for every period.', 'multi'],
  ['NULL', 'No value: not zero, not an empty string. Comparisons with it are unknown; arithmetic with it is NULL; aggregates skip it.', 'single'],
  ['NULLIF', 'NULLIF(a, b) is NULL when a = b, else a. Safe division and turning \'\' into NULL.', 'shaping'],
  ['NULLS FIRST / NULLS LAST', 'Where NULLs go in an ORDER BY. By default they sort last ASC and first DESC.', 'shaping'],
  ['ON vs WHERE', 'ON decides what counts as a match and keeps unmatched left rows in a LEFT JOIN; WHERE runs after the join and drops rows that fail, NULLs included.', 'joins'],
  ['Order of execution', 'FROM → WHERE → GROUP BY → HAVING → window functions → SELECT → ORDER BY → LIMIT.', 'single'],
  ['OVER ()', 'Turns an aggregate into a window function: the result is written onto every row instead of collapsing them.', 'multi'],
  ['PARTITION BY', 'Inside OVER: restarts the window for each group. GROUP BY for a window.', 'multi'],
  ['Pivot', 'Rows to columns. In SQL, conditional aggregation.', 'shaping'],
  ['RANK', 'Ranking where ties share a place and the next place is skipped: 1, 2, 2, 4.', 'multi'],
  ['RIGHT JOIN', 'Keeps every row of the right table. Write it as a LEFT JOIN with the tables swapped.', 'joins'],
  ['ROW_NUMBER', '1, 2, 3 … with no repeats, in the OVER (ORDER BY) order. Needs a tie-breaker to be stable.', 'multi'],
  ['Running total', 'SUM OVER (ORDER BY … ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).', 'multi'],
  ['Scalar subquery', 'A query in parentheses returning one row and one column, used as a value.', 'multi'],
  ['Schema', 'A namespace of tables: lecture.products is schema.table; unqualified names go to public.', 'single'],
  ['Time zone', 'A timestamp with time zone is shown and grouped in the session\'s zone. SET TIME ZONE \'UTC\' or write literals with +00.', 'shaping'],
  ['Top N per group', 'Aggregate; ROW_NUMBER() OVER (PARTITION BY group ORDER BY value DESC); WHERE rn <= N in the next query.', 'multi'],
  ['Window function', 'A calculation across a set of rows that keeps every row: agg OVER (…), ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD.', 'multi'],
];
