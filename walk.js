/* Query walkthroughs: every practice question (reelhouse), lecture exercise (blue_line) and lab question (northgate).
   Practice and lecture answers follow the instructor's solutions. Lab answers are model answers written for this site. */
const SCHEMA = {};
SCHEMA.reel = `<details><summary>reelhouse tables and paths</summary><div class="tw"><table>
<tr><th>Table</th><th>One row is…</th><th>Key</th><th>Columns you need</th></tr>
<tr><td>film</td><td>one film title</td><td>film_id</td><td>title, rating, length, rental_rate, rental_duration, replacement_cost, language_id</td></tr>
<tr><td>language</td><td>one language</td><td>language_id</td><td>name</td></tr>
<tr><td>category</td><td>one genre</td><td>category_id</td><td>name</td></tr>
<tr><td>film_category</td><td>one film in one genre</td><td>(film_id, category_id)</td><td>both key columns</td></tr>
<tr><td>actor</td><td>one actor</td><td>actor_id</td><td>first_name, last_name</td></tr>
<tr><td>film_actor</td><td>one actor in one film</td><td>(actor_id, film_id)</td><td>both key columns</td></tr>
<tr><td>inventory</td><td>one physical copy of one film at one store</td><td>inventory_id</td><td>film_id, store_id</td></tr>
<tr><td>rental</td><td>one rental of one copy by one customer</td><td>rental_id</td><td>rental_date, return_date, inventory_id, customer_id</td></tr>
<tr><td>payment</td><td>one payment, usually one per rental</td><td>payment_id</td><td>rental_id, customer_id, amount, payment_date</td></tr>
<tr><td>customer</td><td>one customer</td><td>customer_id</td><td>first_name, last_name, address_id, create_date</td></tr>
<tr><td>address → city → country</td><td>one address, one city, one country</td><td>address_id, city_id, country_id</td><td>address2, city, country</td></tr>
</table></div>
<p class="note">Paths: film → language · film → film_category → category · film → film_actor → actor · film → inventory · rental → inventory → film · rental → customer · payment → rental · payment → customer · customer → address → city → country. Titles and names are in CAPITALS; genre, language, city and country names are not. rental_date and payment_date are timestamps (SET TIME ZONE 'UTC').</p></details>`;
SCHEMA.north = `<details><summary>northgate tables (labs)</summary><div class="tw"><table>
<tr><th>Table</th><th>One row is…</th><th>Columns you need</th></tr>
<tr><td>products</td><td>one product</td><td>product_id, product_name, brand, unit_price (list), unit_cost, category_name, subcategory_name, weight (blank when not recorded)</td></tr>
<tr><td>stores</td><td>one store, including the online store 999999 (country and state read Online, no floor area)</td><td>store_id, country_name, state, opened_on, closed_on (blank while open), floor_area_m2</td></tr>
<tr><td>customers</td><td>one customer</td><td>customer_id, first_name, middle_initial, last_name, country_name, state_name, birth_date</td></tr>
<tr><td>orders</td><td>one order: the header</td><td>order_id, customer_id, store_id, order_date, delivery_date, currency_code</td></tr>
<tr><td>order_lines</td><td>one product on one order</td><td>order_id, line_number, product_id, quantity, unit_price (list), net_price (charged), unit_cost</td></tr>
<tr><td>calendar</td><td>one calendar day</td><td>calendar_date, year, working_day</td></tr>
<tr><td>exchange_rates</td><td>one currency pair on one day</td><td>rate_date, from_currency, to_currency, rate</td></tr>
</table></div>
<p class="note">Joins: order_lines → orders (order_id) · order_lines → products (product_id) · orders → customers (customer_id) · orders → stores (store_id) · orders → calendar (order_date = calendar_date). Revenue on a line is quantity × net_price. Every date column is a date, not a timestamp. "Today" is DATE '2026-04-20'.</p></details>`;
SCHEMA.blue = `<details><summary>blue_line lecture schema</summary><p class="note">lecture.customers (customer_id, first_name, last_name) · lecture.orders (order_id, customer_id, order_date, region) · lecture.order_items (order_id, product_id, units) · lecture.products (product_id, product_name, category, unit_price) · calendar (calendar_date). 40 customers, 120 orders, 215 line items, 16 products, Jan–Mar 2026.</p></details>`;
SCHEMA.single = SCHEMA.reel + SCHEMA.north + SCHEMA.blue;
SCHEMA.joins = SCHEMA.reel + SCHEMA.north + SCHEMA.blue;
SCHEMA.shaping = SCHEMA.reel + SCHEMA.north + SCHEMA.blue;
SCHEMA.multi = SCHEMA.reel + SCHEMA.north + SCHEMA.blue;

const W = (set, src, n, q, steps, sql, note) => ({ key: `${set}-${src}-${n}`, set, src, db: src === 'practice' ? 'reelhouse' : src === 'lecture' ? 'blue_line' : 'northgate', label: (src === 'practice' ? 'P' : src === 'lecture' ? 'L' : 'Q') + n, q, steps, sql, note });

const WALK = [
/* ================= SINGLE TABLE: practice set ================= */
W('single', 'practice', 1, 'List the first 10 films alphabetically. Show title, rental_rate and length, sorted by title A to Z.',
  ['One row of the answer: one film. Everything lives in film.', 'Three columns, in the order asked.', '"First 10 alphabetically" is ORDER BY title, then LIMIT 10. LIMIT without ORDER BY would be some 10 films, not the first 10.'],
  `SELECT   title, rental_rate, length
FROM     film
ORDER BY title
LIMIT    10;`),
W('single', 'practice', 2, 'Which films rated PG-13 run longer than 150 minutes? Show title and length, longest first; break ties by title.',
  ['One row: one film. Two row conditions, both must hold: AND.', 'Text goes in single quotes: \'PG-13\'.', 'Longest first is ORDER BY length DESC; the tie-breaker title fixes the order among equal lengths.'],
  `SELECT   title, length
FROM     film
WHERE    rating = 'PG-13'
  AND    length > 150
ORDER BY length DESC, title;`, '65 rows.'),
W('single', 'practice', 3, 'What different rental rates does the store charge? One column, each value once, lowest first.',
  ['"Each value once" is DISTINCT. It applies to the whole row, which here is one column.', 'Lowest first: ORDER BY rental_rate, ASC by default.'],
  `SELECT DISTINCT rental_rate
FROM     film
ORDER BY rental_rate;`, '3 rows: 0.99, 2.99, 4.99.'),
W('single', 'practice', 4, 'List the G-rated films that rent for either $0.99 or $2.99. Show title, rental_rate, rating, sorted by title. Use IN.',
  ['One row: one film. Rating is one test; the rate is "either of two values": IN (0.99, 2.99).', 'IN is shorthand for ORs and sidesteps the AND/OR precedence trap. Without it you would need parentheses: rating = \'G\' AND (rental_rate = 0.99 OR rental_rate = 2.99).'],
  `SELECT   title, rental_rate, rating
FROM     film
WHERE    rating = 'G'
  AND    rental_rate IN (0.99, 2.99)
ORDER BY title;`, '123 rows.'),
W('single', 'practice', 5, 'Which films cost between $20 and $25 to replace, both ends included? Show title and replacement_cost, highest first, then title.',
  ['BETWEEN low AND high includes both ends; it is >= 20 AND <= 25. Low value first.', 'Sort DESC on cost, tie-break on title.'],
  `SELECT   title, replacement_cost
FROM     film
WHERE    replacement_cost BETWEEN 20 AND 25
ORDER BY replacement_cost DESC, title;`, '250 rows.'),
W('single', 'practice', 6, 'Find every film whose title contains "love" anywhere, in any case (GLOVES counts). Show title, A to Z. Then explain why LIKE \'%love%\' returns nothing.',
  ['"Contains anywhere" is % on both sides.', '"In any case" is ILIKE. LIKE is case-sensitive.', 'Trap: every title is stored in CAPITALS, so LIKE \'%love%\' matches nothing. LIKE \'%LOVE%\' would work here; ILIKE works regardless.'],
  `SELECT   title
FROM     film
WHERE    title ILIKE '%love%'
ORDER BY title;`, '10 rows. Knowing how the data is stored is part of the answer.'),
W('single', 'practice', 7, 'For films whose title starts with A, compute the rental rate per day: rental_rate / rental_duration. Show title, rental_rate, rental_duration and rate_per_day rounded to 2 decimals. Sort by rate_per_day highest first, then title; top 5.',
  ['"Starts with A" is LIKE \'A%\': no % in front.', 'A calculated column with an alias: ROUND(rental_rate / rental_duration, 2) AS rate_per_day. rental_rate is numeric, so the division keeps its fraction.', 'ORDER BY can use the alias because it runs after SELECT. Then LIMIT 5.'],
  `SELECT   title, rental_rate, rental_duration,
         ROUND(rental_rate / rental_duration, 2) AS rate_per_day
FROM     film
WHERE    title LIKE 'A%'
ORDER BY rate_per_day DESC, title
LIMIT    5;`),
W('single', 'practice', 8, 'In one row: how many films, and the shortest, longest and average length? Name them film_count, shortest, longest, avg_length (1 decimal).',
  ['One row for the whole table: aggregates with no GROUP BY.', 'COUNT(*) for rows, MIN, MAX, ROUND(AVG(length), 1).'],
  `SELECT   COUNT(*)              AS film_count,
         MIN(length)           AS shortest,
         MAX(length)           AS longest,
         ROUND(AVG(length), 1) AS avg_length
FROM     film;`, '1000 · 46 · 185 · 115.3'),
W('single', 'practice', 9, 'How many films are there in each rating? Show rating and film_count, largest first.',
  ['One row per rating: GROUP BY rating sets the granularity.', 'COUNT(*) per group; sort by the alias DESC.'],
  `SELECT   rating, COUNT(*) AS film_count
FROM     film
GROUP BY rating
ORDER BY film_count DESC;`, 'PG-13 223 · NC-17 210 · R 195 · PG 194 · G 178'),
W('single', 'practice', 10, 'Average replacement cost for each rating, rounded to 2 decimals, sorted by rating. Notice the order the ratings come out in.',
  ['GROUP BY rating, ROUND(AVG(replacement_cost), 2).', 'Watch: rating is an enumerated type. ORDER BY rating follows its list, G, PG, PG-13, R, NC-17, not the alphabet. A column\'s type decides how it sorts.'],
  `SELECT   rating, ROUND(AVG(replacement_cost), 2) AS avg_replacement_cost
FROM     film
GROUP BY rating
ORDER BY rating;`),
W('single', 'practice', 11, 'For payments made in calendar year 2025, one row: number of payments, total amount, average amount (2 decimals). Name them payments, total_amount, avg_amount.',
  ['One row, three aggregates, filtered first by WHERE.', 'payment_date is a timestamp. Use the half-open range >= \'2025-01-01\' AND < \'2026-01-01\' so every moment of 31 December counts. BETWEEN \'2025-01-01\' AND \'2025-12-31\' would miss everything after midnight that day.'],
  `SELECT   COUNT(*)              AS payments,
         SUM(amount)           AS total_amount,
         ROUND(AVG(amount), 2) AS avg_amount
FROM     payment
WHERE    payment_date >= '2025-01-01'
  AND    payment_date <  '2026-01-01';`, '8916 · 26254.84 · 2.94'),
W('single', 'practice', 12, 'For rentals made in 2025, one row: the number of rentals and the number of different customers who rented. Name them rentals and customers.',
  ['COUNT(*) counts rentals; COUNT(DISTINCT customer_id) counts people.', 'Same half-open date range on a timestamp.'],
  `SELECT   COUNT(*)                    AS rentals,
         COUNT(DISTINCT customer_id) AS customers
FROM     rental
WHERE    rental_date >= '2025-01-01'
  AND    rental_date <  '2026-01-01';`, '9092 rentals · 955 customers'),
W('single', 'practice', 13, 'Which customers have rented 88 or more times, across all dates? Show customer_id and rentals, most first, then customer_id.',
  ['One row per customer: GROUP BY customer_id.', '"88 or more" is a condition on a count, which only exists after grouping: HAVING COUNT(*) >= 88.'],
  `SELECT   customer_id, COUNT(*) AS rentals
FROM     rental
GROUP BY customer_id
HAVING   COUNT(*) >= 88
ORDER BY rentals DESC, customer_id;`, '9 rows.'),
W('single', 'practice', 14, 'In one row from rental: every rental (total_rentals), rentals with a return date (returned_rentals), and different customers (customers). Use a different form of COUNT for each.',
  ['COUNT(*) counts rows.', 'COUNT(return_date) skips the NULLs, so it counts returned rentals.', 'COUNT(DISTINCT customer_id) counts different values.'],
  `SELECT   COUNT(*)                    AS total_rentals,
         COUNT(return_date)          AS returned_rentals,
         COUNT(DISTINCT customer_id) AS customers
FROM     rental;`, '51805 · 51564 · 997'),
W('single', 'practice', 15, 'For payments between $0.99 and $4.99 inclusive, count the payments at each amount. Show amount and payments, sorted by amount.',
  ['WHERE narrows the rows first (BETWEEN, both ends in).', 'GROUP BY amount counts what is left, one row per distinct amount.'],
  `SELECT   amount, COUNT(*) AS payments
FROM     payment
WHERE    amount BETWEEN 0.99 AND 4.99
GROUP BY amount
ORDER BY amount;`, '7 rows.'),
W('single', 'practice', 16, 'WHERE return_date = NULL returns no rows and no error. Explain, fix it, return the 10 earliest unreturned rentals (by rental_date then rental_id), and separately count them.',
  ['NULL means unknown; anything compared with unknown is unknown, not true, so = NULL never keeps a row.', 'Test with IS NULL.', 'Two queries: the list with ORDER BY and LIMIT, and a COUNT(*) with the same WHERE.'],
  `SELECT   rental_id, rental_date, customer_id
FROM     rental
WHERE    return_date IS NULL
ORDER BY rental_date, rental_id
LIMIT    10;

SELECT   COUNT(*) AS unreturned
FROM     rental
WHERE    return_date IS NULL;`, '241 unreturned.'),
W('single', 'practice', 17, '"Films rated G or PG that rent for $4.99." WHERE rating = \'G\' OR rating = \'PG\' AND rental_rate = 4.99 returns films that do not rent for $4.99. Explain, then fix it two ways.',
  ['AND binds tighter than OR, so the database reads rating = \'G\' OR (rating = \'PG\' AND rental_rate = 4.99): every G film at any price.', 'Fix 1: parentheses around the OR.', 'Fix 2: IN (\'G\', \'PG\'), which has no precedence problem.'],
  `SELECT   title, rating, rental_rate
FROM     film
WHERE    (rating = 'G' OR rating = 'PG')
  AND    rental_rate = 4.99
ORDER BY rating, title;

SELECT   title, rating, rental_rate
FROM     film
WHERE    rating IN ('G', 'PG')
  AND    rental_rate = 4.99
ORDER BY rating, title;`, 'Fixed: 123 rows.'),
W('single', 'practice', 18, 'SELECT title, length / 60.0 AS hours FROM film WHERE hours > 3 fails. Explain with the order of execution, fix it, sort longest first then title. Can ORDER BY use hours?',
  ['WHERE runs before SELECT, so the alias hours does not exist yet when the filter is checked.', 'Repeat the expression in WHERE: length / 60.0 > 3. The 60.0 keeps the division decimal.', 'ORDER BY runs after SELECT, so ORDER BY hours DESC is fine.'],
  `SELECT   title, ROUND(length / 60.0, 2) AS hours
FROM     film
WHERE    length / 60.0 > 3
ORDER BY hours DESC, title;`, '39 rows. Order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.'),
W('single', 'practice', 19, 'Which customers made at least 3 payments of $9.99 or more? Show customer_id and big_payments, highest first, then customer_id. Why can $9.99 not go in HAVING, and "at least 3" not in WHERE?',
  ['amount belongs to one payment row: WHERE amount >= 9.99 filters rows before grouping.', 'COUNT(*) only exists once the rows are grouped: HAVING COUNT(*) >= 3.', 'Each condition goes where the thing it tests exists.'],
  `SELECT   customer_id, COUNT(*) AS big_payments
FROM     payment
WHERE    amount >= 9.99
GROUP BY customer_id
HAVING   COUNT(*) >= 3
ORDER BY big_payments DESC, customer_id;`, '17 rows.'),
W('single', 'practice', 20, 'How many addresses have no second line? Query 1: total_addresses and address2_not_null. Query 2: no_second_line, where address2 is NULL or \'\'. Why is "not NULL" not the same as "has a second line"?',
  ['COUNT(address2) counts every value that is not NULL, and an empty string is not NULL.', '999 addresses store \'\' in address2, so address2_not_null is 999 while nobody has a second line.', 'The second query tests both: IS NULL OR = \'\'.'],
  `SELECT   COUNT(*)        AS total_addresses,
         COUNT(address2) AS address2_not_null
FROM     address;

SELECT   COUNT(*) AS no_second_line
FROM     address
WHERE    address2 IS NULL
   OR    address2 = '';`, '1003 and 999; then 1003.'),

/* ================= SINGLE TABLE: lecture exercises ================= */
W('single', 'lecture', 1, 'Which Merchandise products cost under $15.00? Name and price, cheapest first.',
  ['One row: one product. Two row conditions, AND.', 'Cheapest first: ORDER BY unit_price, ascending by default.'],
  `SELECT   product_name, unit_price
FROM     lecture.products
WHERE    category = 'Merchandise'
  AND    unit_price < 15
ORDER BY unit_price;`, '2 rows: Ceramic Mug 12.50, Canvas Tote 14.00.'),
W('single', 'lecture', 2, 'How many different customers placed an order in March 2026?',
  ['One number: COUNT(DISTINCT customer_id), not COUNT(*), which would count orders.', 'order_date here is a plain date, so BETWEEN the first and last day is safe; >= \'2026-03-01\' AND < \'2026-04-01\' is also right and works on timestamps too.'],
  `SELECT COUNT(DISTINCT customer_id)
FROM   lecture.orders
WHERE  order_date BETWEEN '2026-03-01' AND '2026-03-31';`, '28 customers.'),
W('single', 'lecture', 3, 'Which orders have three line items? Order ID and item count, from order_items.',
  ['One row of order_items is one product on one order, so a row count per order is an item count.', 'One row of the answer: one order. GROUP BY order_id.', 'Trap: "three" is a condition on the count, so it belongs in HAVING, not WHERE.'],
  `SELECT   order_id, COUNT(*) AS items
FROM     lecture.order_items
GROUP BY order_id
HAVING   COUNT(*) = 3
ORDER BY order_id;`, '21 orders.'),

/* ================= SINGLE TABLE: lab ================= */
W('single', 'lab', 1, 'The ten most expensive products: product_id, product_name, unit_price. Sort by unit_price highest first, then product_id. Ten rows.',
  ['One row: one product. No filter.', 'ORDER BY unit_price DESC, product_id as tie-breaker, then LIMIT 10.'],
  `SELECT   product_id, product_name, unit_price
FROM     products
ORDER BY unit_price DESC, product_id
LIMIT    10;`),
W('single', 'lab', 2, 'Every store in Germany, France or Italy: store_id, country_name, state, opened_on. Sort by country_name, then store_id.',
  ['"One of three countries" is IN; a chain of ORs also works, but IN avoids precedence mistakes.'],
  `SELECT   store_id, country_name, state, opened_on
FROM     stores
WHERE    country_name IN ('Germany', 'France', 'Italy')
ORDER BY country_name, store_id;`),
W('single', 'lab', 3, 'What product categories does Northgate sell? One column, each category once, alphabetical.',
  ['DISTINCT on one column; ORDER BY it.'],
  `SELECT DISTINCT category_name
FROM     products
ORDER BY category_name;`),
W('single', 'lab', 4, 'Every product whose name contains laptop or desktop, any capitalization, with a list price from 500 to 1,000 inclusive. product_id, product_name, unit_price; price highest first, then product_id.',
  ['"Any capitalization" is ILIKE with % on both sides.', 'Trap: the OR between the two patterns must be in parentheses, because the AND with the price range binds tighter.', 'Inclusive range: BETWEEN 500 AND 1000.'],
  `SELECT   product_id, product_name, unit_price
FROM     products
WHERE    (product_name ILIKE '%laptop%' OR product_name ILIKE '%desktop%')
  AND    unit_price BETWEEN 500 AND 1000
ORDER BY unit_price DESC, product_id;`),
W('single', 'lab', 5, 'Which physical stores are still open? store_id, country_name, state, floor_area_m2 for every store that has not closed, leaving out the online store. Sort by floor_area_m2 largest first, then store_id.',
  ['"Has not closed" means closed_on is empty: IS NULL, never = NULL.', '"Leaving out the online store": store_id <> 999999. Its floor area is NULL, and in PostgreSQL NULLs sort first in a DESC order, so forgetting this puts the online store at the top.'],
  `SELECT   store_id, country_name, state, floor_area_m2
FROM     stores
WHERE    closed_on IS NULL
  AND    store_id <> 999999
ORDER BY floor_area_m2 DESC, store_id;`),
W('single', 'lab', 6, 'A one-row summary of orders: number of orders, different customers, different stores, earliest and latest order date.',
  ['One row: aggregates, no GROUP BY.', 'COUNT(*) for orders; COUNT(DISTINCT …) for customers and stores; MIN and MAX of the date.'],
  `SELECT   COUNT(*)                    AS orders,
         COUNT(DISTINCT customer_id) AS customers,
         COUNT(DISTINCT store_id)    AS stores,
         MIN(order_date)             AS first_order,
         MAX(order_date)             AS last_order
FROM     orders;`),
W('single', 'lab', 7, 'For each category: category_name, number of products, average unit_price (2 decimals). Sort by number of products most first, then category_name.',
  ['One row per category: GROUP BY category_name.', 'Sort by the count DESC; the alias works in ORDER BY.'],
  `SELECT   category_name,
         COUNT(*)                   AS products,
         ROUND(AVG(unit_price), 2)  AS avg_price
FROM     products
GROUP BY category_name
ORDER BY products DESC, category_name;`),
W('single', 'lab', 8, 'The ten products with the highest margin percentage at list price: product_id, product_name, unit_price, unit_cost, the unit margin (price minus cost), and the margin percentage (margin / price × 100, 1 decimal). Sort by that rounded percentage, highest first, then product_id. Ten rows.',
  ['Two calculated columns. unit_price is numeric, so the division keeps decimals.', 'Sort by the alias of the rounded percentage, as the question says, then product_id, then LIMIT 10.'],
  `SELECT   product_id, product_name, unit_price, unit_cost,
         unit_price - unit_cost                                   AS unit_margin,
         ROUND((unit_price - unit_cost) / unit_price * 100, 1)   AS margin_pct
FROM     products
ORDER BY margin_pct DESC, product_id
LIMIT    10;`),
W('single', 'lab', 9, 'How many orders were placed in each currency during 2025? currency_code and the number of orders; most first, then currency_code.',
  ['Rows first: WHERE on the date, half-open range.', 'Then GROUP BY currency_code with COUNT(*).'],
  `SELECT   currency_code, COUNT(*) AS orders
FROM     orders
WHERE    order_date >= '2025-01-01'
  AND    order_date <  '2026-01-01'
GROUP BY currency_code
ORDER BY orders DESC, currency_code;`),
W('single', 'lab', 10, 'Which subcategories have more than 100 products? subcategory_name and the count, only for subcategories with more than 100; most first, then subcategory_name.',
  ['"More than 100 products" is a condition on a count: HAVING.'],
  `SELECT   subcategory_name, COUNT(*) AS products
FROM     products
GROUP BY subcategory_name
HAVING   COUNT(*) > 100
ORDER BY products DESC, subcategory_name;`),
W('single', 'lab', 11, 'Which ten products sold the most units across all orders? product_id, total units (SUM of quantity), number of order lines, net revenue (SUM of quantity × net_price, 2 decimals). Sort by units most first, then product_id. Ten rows.',
  ['Everything is in order_lines; no join needed.', 'One row per product: GROUP BY product_id. COUNT(*) is lines because one row is one line.'],
  `SELECT   product_id,
         SUM(quantity)                          AS units,
         COUNT(*)                               AS lines,
         ROUND(SUM(quantity * net_price), 2)    AS revenue
FROM     order_lines
GROUP BY product_id
ORDER BY units DESC, product_id
LIMIT    10;`),
W('single', 'lab', 12, 'In one row from stores: total stores, stores with a floor area recorded, stores that have closed, and the average floor area (1 decimal). Be ready to explain why the first three differ.',
  ['COUNT(*) is every row. COUNT(floor_area_m2) skips the NULL of the online store. COUNT(closed_on) counts only stores whose closed_on is filled in, which is the closed ones.', 'AVG skips the NULL too, so it averages the physical stores only.'],
  `SELECT   COUNT(*)                   AS stores,
         COUNT(floor_area_m2)       AS with_floor_area,
         COUNT(closed_on)           AS closed,
         ROUND(AVG(floor_area_m2), 1) AS avg_floor_area
FROM     stores;`),
W('single', 'lab', 13, 'Physical stores that took at least 2,400 orders in 2024: store_id and the number of orders. Leave out the online store, include only 2024, keep only 2,400 or more. Most first, then store_id.',
  ['Row filters in WHERE: not the online store, and the 2024 date range.', 'Group filter in HAVING: COUNT(*) >= 2400.'],
  `SELECT   store_id, COUNT(*) AS orders
FROM     orders
WHERE    store_id <> 999999
  AND    order_date >= '2024-01-01'
  AND    order_date <  '2025-01-01'
GROUP BY store_id
HAVING   COUNT(*) >= 2400
ORDER BY orders DESC, store_id;`, 'In the site\'s 10% sample use 240 instead of 2,400.'),
W('single', 'lab', 14, 'Using only order_lines, one row: number of lines, number of orders, average lines per order (2 decimals), average quantity per line (2 decimals).',
  ['Lines are rows: COUNT(*). Orders are distinct order_id values.', 'Trap: lines per order is a count divided by a count, both integers, so cast one side to numeric or the result is a whole number.', 'AVG(quantity) is per line because one row is one line.'],
  `SELECT   COUNT(*)                                                    AS lines,
         COUNT(DISTINCT order_id)                                    AS orders,
         ROUND(CAST(COUNT(*) AS numeric) / COUNT(DISTINCT order_id), 2) AS lines_per_order,
         ROUND(AVG(quantity), 2)                                     AS qty_per_line
FROM     order_lines;`),
W('single', 'lab', 15, 'A line is discounted when net_price is below unit_price. For discounted lines only, group by quantity: quantity, number of discounted lines, average discount percentage ((unit_price − net_price) / unit_price × 100, 2 decimals). Keep only quantities with at least 50,000 discounted lines. Sort by quantity.',
  ['"Discounted lines only" is a row filter: WHERE net_price < unit_price.', '"At least 50,000 lines" is a group filter: HAVING COUNT(*) >= 50000.', 'The discount is computed per row inside AVG.'],
  `SELECT   quantity,
         COUNT(*)                                                   AS discounted_lines,
         ROUND(AVG((unit_price - net_price) / unit_price * 100), 2) AS avg_discount_pct
FROM     order_lines
WHERE    net_price < unit_price
GROUP BY quantity
HAVING   COUNT(*) >= 50000
ORDER BY quantity;`, 'In the site\'s 10% sample the threshold of 50,000 keeps nothing; try 5000 in the playground.'),

/* ================= JOINS: practice set ================= */
W('joins', 'practice', 1, 'List the films in Japanese. Show title and the language name as language, sorted by title.',
  ['One row: one film. The title is in film; the language name is in language; film holds only language_id.', 'film.language_id → language.language_id. One join, many-to-one, so each film still appears once.', 'Filter on the language name after the join.'],
  `SELECT   f.title, l.name AS language
FROM     film f
JOIN     language l ON l.language_id = f.language_id
WHERE    l.name = 'Japanese'
ORDER BY f.title;`, '72 rows.'),
W('joins', 'practice', 2, 'List the films filed under the Horror genre. Show title only, A to Z.',
  ['One row: one film. The genre name is in category; film_category is the bridge between film and category.', 'Two joins to get from a film to the name of its genre, even though no column from film_category is shown.'],
  `SELECT   f.title
FROM     film f
JOIN     film_category fc ON fc.film_id = f.film_id
JOIN     category c       ON c.category_id = fc.category_id
WHERE    c.name = 'Horror'
ORDER BY f.title;`, '142 rows.'),
W('joins', 'practice', 3, 'Which films does PENELOPE GUINESS appear in? Show title and rating, sorted by title.',
  ['One row: one film. Names are in actor, title in film; film_actor bridges the many-to-many.', 'Its key is the pair (actor_id, film_id); each join uses one half.', 'Names are stored in capitals, so match \'PENELOPE\' and \'GUINESS\'.'],
  `SELECT   f.title, f.rating
FROM     actor a
JOIN     film_actor fa ON fa.actor_id = a.actor_id
JOIN     film f        ON f.film_id = fa.film_id
WHERE    a.first_name = 'PENELOPE'
  AND    a.last_name  = 'GUINESS'
ORDER BY f.title;`, '19 rows.'),
W('joins', 'practice', 4, 'Which customers live in Canada? first_name, last_name, city; sorted by last_name, then first_name.',
  ['One row: one customer. customer holds address_id, not the city or country.', 'Four tables in a chain: customer → address → city → country. The filter is on the last table, but every table in the chain is needed to reach it.'],
  `SELECT   cu.first_name, cu.last_name, ci.city
FROM     customer cu
JOIN     address a  ON a.address_id = cu.address_id
JOIN     city ci    ON ci.city_id = a.city_id
JOIN     country co ON co.country_id = ci.country_id
WHERE    co.country = 'Canada'
ORDER BY cu.last_name, cu.first_name;`, '5 rows.'),
W('joins', 'practice', 5, 'How many films are in each genre? category and film_count, largest first, then category. Why do the counts not add up to 1,000?',
  ['One row: one genre. The input rows are film–genre pairs from film_category; the film table itself is not needed.', 'GROUP BY the genre name, COUNT(*) pairs.', 'The counts add up to 2,367: most films are in two or three genres and are counted once in each.'],
  `SELECT   c.name AS category, COUNT(*) AS film_count
FROM     category c
JOIN     film_category fc ON fc.category_id = c.category_id
GROUP BY c.name
ORDER BY film_count DESC, category;`, '16 rows.'),
W('joins', 'practice', 6, 'The 10 most recent rentals with the film and the customer: rental_id, rental_date, title, first_name, last_name; newest first, ties by rental_id highest first.',
  ['One row: one rental. A rental points to a copy (inventory), not a film, so the film is two joins away: rental → inventory → film.', 'The customer is one join away on a separate branch: rental → customer.', 'ORDER BY rental_date DESC, rental_id DESC, LIMIT 10.'],
  `SELECT   r.rental_id, r.rental_date, f.title, cu.first_name, cu.last_name
FROM     rental r
JOIN     inventory i ON i.inventory_id = r.inventory_id
JOIN     film f      ON f.film_id = i.film_id
JOIN     customer cu ON cu.customer_id = r.customer_id
ORDER BY r.rental_date DESC, r.rental_id DESC
LIMIT    10;`),
W('joins', 'practice', 7, 'Which films have no actors listed? film_id and title, sorted by title. Use a LEFT JOIN.',
  ['One row: one film. "No actors" means the rows with no match: an anti-join from film to film_actor.', 'actor itself is not needed: whether a film has any actors is settled by film_actor.', 'Test a column that cannot be NULL in a real match, such as fa.actor_id.'],
  `SELECT   f.film_id, f.title
FROM     film f
LEFT JOIN film_actor fa ON fa.film_id = f.film_id
WHERE    fa.actor_id IS NULL
ORDER BY f.title;`, '3 films.'),
W('joins', 'practice', 8, 'Total payment amount for each genre, following the path from payment to category. category and revenue, highest first, then category. Then compare the sum of the 16 revenues with SUM(amount) from payment.',
  ['One row: one genre. The path is payment → rental → inventory → film_category → category (film_category already has film_id, so film is not needed).', 'A film in three genres puts each of its payments into all three. Each genre\'s total is right on its own.', 'The 16 revenues add up to 405,100.72 against 170,962.39 in payment: the breakdown overlaps, so never add it up.'],
  `SELECT   c.name AS category, SUM(p.amount) AS revenue
FROM     payment p
JOIN     rental r         ON r.rental_id = p.rental_id
JOIN     inventory i      ON i.inventory_id = r.inventory_id
JOIN     film_category fc ON fc.film_id = i.film_id
JOIN     category c       ON c.category_id = fc.category_id
GROUP BY c.name
ORDER BY revenue DESC, category;`),
W('joins', 'practice', 9, 'Which 10 countries have the most rentals, counted by the customer\'s country? country and rentals, most first, then country.',
  ['One row: one country. The customer path walked from rental: rental → customer → address → city → country.', 'Every step is many-to-one, so each rental lands in exactly one country and nothing is counted twice.'],
  `SELECT   co.country, COUNT(*) AS rentals
FROM     rental r
JOIN     customer cu ON cu.customer_id = r.customer_id
JOIN     address a   ON a.address_id = cu.address_id
JOIN     city ci     ON ci.city_id = a.city_id
JOIN     country co  ON co.country_id = ci.country_id
GROUP BY co.country
ORDER BY rentals DESC, co.country
LIMIT    10;`, 'Mexico 11,827 · India 4,195 · China 3,720 …'),
W('joins', 'practice', 10, 'Which customers have never rented anything? customer_id, first_name, last_name; sorted by customer_id.',
  ['One row: one customer. "Never" is the anti-join from customer to rental.', 'A customer with rentals appears once per rental; one with none appears once, with NULLs, and IS NULL keeps just those.'],
  `SELECT   cu.customer_id, cu.first_name, cu.last_name
FROM     customer cu
LEFT JOIN rental r ON r.customer_id = cu.customer_id
WHERE    r.rental_id IS NULL
ORDER BY cu.customer_id;`, '2 customers.'),
W('joins', 'practice', 11, 'How many actors are listed for each film, including films with none? title and cast_size, smallest cast first, then title. All 1,000 films must appear.',
  ['"Including films with none" means start from film with a LEFT JOIN to film_actor.', 'Count a column from the right table: COUNT(fa.actor_id) gives 0 for the three films with no actors. COUNT(*) would give 1.', 'Group by the key and the title.'],
  `SELECT   f.title, COUNT(fa.actor_id) AS cast_size
FROM     film f
LEFT JOIN film_actor fa ON fa.film_id = f.film_id
GROUP BY f.film_id, f.title
ORDER BY cast_size, f.title;`, '1000 rows; three show 0.'),
W('joins', 'practice', 12, 'Which films does store 2 not carry? film_id and title, sorted by title, with one LEFT JOIN from film to inventory. Then move the store_id = 2 test to the other clause and report the row count.',
  ['One row: one film. Anti-join from film to inventory, but only store 2\'s copies may count as a match.', 'The store test belongs in ON: it decides which inventory rows may match, so a film with copies only at store 1 gets NULLs and survives IS NULL.', 'Trap: in WHERE it runs after the join, and store_id = 2 AND inventory_id IS NULL can never both be true on one row: 0 rows.'],
  `SELECT   f.film_id, f.title
FROM     film f
LEFT JOIN inventory i ON i.film_id = f.film_id
                     AND i.store_id = 2
WHERE    i.inventory_id IS NULL
ORDER BY f.title;`, '238 rows, including the 42 films with no copies anywhere.'),
W('joins', 'practice', 13, 'Which actors appear in 8 or more Horror films? actor_id, first_name, last_name, horror_films; most first, then last_name, first_name, actor_id. Why does the question ask for actor_id?',
  ['One row: one actor. actor → film_actor gives film_id; film_category has film_id too, so they join directly, then category for the name. film is not needed.', 'Filter on the genre in WHERE, group per actor, HAVING COUNT(*) >= 8.', 'Group by the key: two different actors are named SUSAN DAVIS (101 and 110); grouping by name alone would merge them.'],
  `SELECT   a.actor_id, a.first_name, a.last_name, COUNT(*) AS horror_films
FROM     actor a
JOIN     film_actor fa    ON fa.actor_id = a.actor_id
JOIN     film_category fc ON fc.film_id = fa.film_id
JOIN     category c       ON c.category_id = fc.category_id
WHERE    c.name = 'Horror'
GROUP BY a.actor_id, a.first_name, a.last_name
HAVING   COUNT(*) >= 8
ORDER BY horror_films DESC, a.last_name, a.first_name, a.actor_id;`, '8 rows.'),
W('joins', 'practice', 14, 'The 5 customers who have paid the most in total, and where they live. Total payment by the customer on the payment. customer_id, first_name, last_name, city, country, total_paid; highest first, then customer_id.',
  ['One row: one customer. payment carries customer_id, so go straight to customer, then along the customer path to country.', 'Every non-aggregated column in SELECT must be in GROUP BY. Adding city and country does not split the groups, because each customer has one address.'],
  `SELECT   cu.customer_id, cu.first_name, cu.last_name, ci.city, co.country,
         SUM(p.amount) AS total_paid
FROM     payment p
JOIN     customer cu ON cu.customer_id = p.customer_id
JOIN     address a   ON a.address_id = cu.address_id
JOIN     city ci     ON ci.city_id = a.city_id
JOIN     country co  ON co.country_id = ci.country_id
GROUP BY cu.customer_id, cu.first_name, cu.last_name, ci.city, co.country
ORDER BY total_paid DESC, cu.customer_id
LIMIT    5;`, 'KARL SEAL 358.12 first.'),
W('joins', 'practice', 15, 'Revenue by film language: language, payments, revenue; highest revenue first. Check the revenues add up to SUM(amount) from payment.',
  ['One row: one language. payment → rental → inventory → film → language.', 'Unlike the genre question, every step is many-to-one, so each payment lands in exactly one language: 51,061 payments and 170,962.39, the same as payment itself.'],
  `SELECT   l.name AS language,
         COUNT(*)      AS payments,
         SUM(p.amount) AS revenue
FROM     payment p
JOIN     rental r    ON r.rental_id = p.rental_id
JOIN     inventory i ON i.inventory_id = r.inventory_id
JOIN     film f      ON f.film_id = i.film_id
JOIN     language l  ON l.language_id = f.language_id
GROUP BY l.name
ORDER BY revenue DESC;`),
W('joins', 'practice', 16, '"Every customer with the number of rentals they made in 2025, including customers with none." The colleague\'s LEFT JOIN with the date test in WHERE returns fewer rows than customers and never 0. Explain and fix.',
  ['The WHERE on rental_date runs after the LEFT JOIN. A customer with no 2025 rental has NULL there, NULL fails the test, and the row is thrown away: the LEFT JOIN behaves like an INNER JOIN.', 'Move the date test into ON, where it decides what counts as a match.', 'Count a column from the right table so the unmatched customers show 0.'],
  `SELECT   cu.customer_id, cu.first_name, cu.last_name,
         COUNT(r.rental_id) AS rentals_2025
FROM     customer cu
LEFT JOIN rental r ON r.customer_id = cu.customer_id
                  AND r.rental_date >= '2025-01-01'
                  AND r.rental_date <  '2026-01-01'
GROUP BY cu.customer_id, cu.first_name, cu.last_name
ORDER BY rentals_2025, cu.customer_id;`, 'Broken: 955 rows. Fixed: 999 rows, 44 of them 0.'),
W('joins', 'practice', 17, '"Copies of each film in inventory, including films with no copies." film LEFT JOIN inventory with COUNT(*) says no film has zero copies. Explain and fix.',
  ['COUNT(*) counts rows, and a film with no copies still has one row after the LEFT JOIN: the film, with NULLs on the inventory side.', 'COUNT(column) skips NULLs, so count a column from the right-hand table: COUNT(i.inventory_id).', 'The broken query shows 42 films with 1 copy; those 42 have 0, and no film has exactly 1.'],
  `SELECT   f.title, COUNT(i.inventory_id) AS copies
FROM     film f
LEFT JOIN inventory i ON i.film_id = f.film_id
GROUP BY f.film_id, f.title
ORDER BY copies, f.title;`),
W('joins', 'practice', 18, 'Revenue by rating, copied from the revenue-by-genre query, adds up to far more than the business took in. Explain where the extra money comes from and fix it.',
  ['film_category has two or three rows for most films, so the join repeats each payment once per genre of its film and SUM adds it that many times.', 'Rating lives on film, so the category tables are not needed at all. Join only the tables the question needs.', 'Broken total 405,100.72; fixed 170,962.39, equal to SUM(amount) FROM payment.'],
  `SELECT   f.rating, SUM(p.amount) AS revenue
FROM     payment p
JOIN     rental r    ON r.rental_id = p.rental_id
JOIN     inventory i ON i.inventory_id = r.inventory_id
JOIN     film f      ON f.film_id = i.film_id
GROUP BY f.rating
ORDER BY f.rating;

SELECT   SUM(amount) AS total_revenue
FROM     payment;`),
W('joins', 'practice', 19, 'For each genre, the number of different films rented and the total rentals. The colleague\'s COUNT(f.film_id) and COUNT(r.rental_id) come out identical. What is one row of the joined table? Fix films_rented. Why does the rentals column add up to more than the rows in rental?',
  ['After the join, one row is one rental in one genre, not one film. COUNT(*) and COUNT(f.film_id) both count rentals.', 'COUNT(DISTINCT f.film_id) counts the films those rentals belong to.', 'The rentals column adds up to 122,666 against 51,805: a rental of a film in three genres is counted once in each.'],
  `SELECT   c.name AS category,
         COUNT(DISTINCT f.film_id) AS films_rented,
         COUNT(*)                  AS rentals
FROM     rental r
JOIN     inventory i      ON i.inventory_id = r.inventory_id
JOIN     film f           ON f.film_id = i.film_id
JOIN     film_category fc ON fc.film_id = f.film_id
JOIN     category c       ON c.category_id = fc.category_id
GROUP BY c.name
ORDER BY rentals DESC, category;`),
W('joins', 'practice', 20, 'Which films have never been rented? A film with no copies counts. The colleague\'s film JOIN inventory LEFT JOIN rental WHERE rental_id IS NULL returns nothing. Explain, fix, and write an anti-join from inventory to rental counting copies never rented.',
  ['The INNER JOIN to inventory drops every film with no copies before the LEFT JOIN to rental is reached.', 'Every copy that exists has been rented at least once (copies_never_rented is 0), so nothing is left for IS NULL to find.', 'Both joins must be LEFT JOINs to keep the films with no copies: 42 films, the same 42 with no copies.'],
  `SELECT   f.film_id, f.title
FROM     film f
LEFT JOIN inventory i ON i.film_id = f.film_id
LEFT JOIN rental r    ON r.inventory_id = i.inventory_id
WHERE    r.rental_id IS NULL
ORDER BY f.title;

SELECT   COUNT(*) AS copies_never_rented
FROM     inventory i
LEFT JOIN rental r ON r.inventory_id = i.inventory_id
WHERE    r.rental_id IS NULL;`),

/* ================= JOINS: lecture ================= */
W('joins', 'lecture', 1, 'What is the revenue by region, highest first?',
  ['One row: one region. Region is on orders; units on order_items; price on products.', 'orders → order_items → products. Revenue is SUM(units × price) over line rows, which is the right granularity for line amounts.'],
  `SELECT   o.region, SUM(oi.units * p.unit_price) AS revenue
FROM     lecture.orders AS o
JOIN     lecture.order_items AS oi ON oi.order_id = o.order_id
JOIN     lecture.products AS p     ON p.product_id = oi.product_id
GROUP BY o.region
ORDER BY revenue DESC;`, 'Southeast 4,712.75 · Northeast 2,999.70 · Midwest 2,853.05 · West 2,567.95'),
W('joins', 'lecture', 2, 'Which customers placed no order in March 2026? First and last name.',
  ['One row: one customer. "No order in March" is an anti-join from customers to orders, but only March orders may count as a match.', 'Trap: the date goes in ON. In WHERE it would drop the NULL rows and turn the LEFT JOIN into an INNER JOIN, and the customers with no March order are exactly the ones you want.'],
  `SELECT   c.first_name, c.last_name
FROM     lecture.customers AS c
LEFT JOIN lecture.orders   AS o
  ON     o.customer_id = c.customer_id
 AND     o.order_date >= '2026-03-01'
WHERE    o.order_id IS NULL
ORDER BY c.last_name, c.first_name;`, '12 customers.'),
W('joins', 'lecture', 3, 'For each product category, in how many different orders did it appear?',
  ['One row: one category. Category is on products; the order is on order_items.', 'A category appears on several lines of the same order, so COUNT(*) would count lines. COUNT(DISTINCT oi.order_id) counts orders.'],
  `SELECT   p.category, COUNT(DISTINCT oi.order_id) AS orders
FROM     lecture.order_items AS oi
JOIN     lecture.products AS p ON p.product_id = oi.product_id
GROUP BY p.category
ORDER BY orders DESC;`, 'Beverages 67 · Bakery 55 · Packaged Goods 38 · Merchandise 28'),

/* ================= JOINS: lab ================= */
W('joins', 'lab', 1, 'Every line on order 29930036: line_number, product_name, quantity. Sort by line_number.',
  ['One row: one line. Product names live in products: order_lines → products.', 'Filter on the order id in WHERE.'],
  `SELECT   ol.line_number, p.product_name, ol.quantity
FROM     order_lines AS ol
JOIN     products    AS p ON p.product_id = ol.product_id
WHERE    ol.order_id = 29930036
ORDER BY ol.line_number;`, 'That order is not in the site\'s 10% sample; try order_id 29930030 in the playground.'),
W('joins', 'lab', 2, 'Every order placed on 9 April 2025: order_id, the customer\'s first_name and last_name, the store\'s country_name. Sort by order_id.',
  ['One row: one order. Two branches from orders: orders → customers and orders → stores.', 'order_date is a plain date, so = DATE \'2025-04-09\' is exact.'],
  `SELECT   o.order_id, c.first_name, c.last_name, s.country_name
FROM     orders    AS o
JOIN     customers AS c ON c.customer_id = o.customer_id
JOIN     stores    AS s ON s.store_id    = o.store_id
WHERE    o.order_date = DATE '2025-04-09'
ORDER BY o.order_id;`),
W('joins', 'lab', 3, 'Revenue by category: category_name and the sum of quantity × net_price (2 decimals). Highest first, then category_name.',
  ['One row: one category. order_lines → products; orders is not needed.', 'Revenue is summed over line rows, its own granularity.'],
  `SELECT   p.category_name,
         ROUND(SUM(ol.quantity * ol.net_price), 2) AS revenue
FROM     order_lines AS ol
JOIN     products    AS p ON p.product_id = ol.product_id
GROUP BY p.category_name
ORDER BY revenue DESC, p.category_name;`),
W('joins', 'lab', 4, 'How many orders did each store country take in 2025? The store\'s country_name and the number of orders; most first, then country_name.',
  ['One row: one store country. orders → stores; each order has one store, so COUNT(*) counts orders.', 'Date range in WHERE on orders (a plain date, but the half-open range is still the habit).'],
  `SELECT   s.country_name, COUNT(*) AS orders
FROM     orders AS o
JOIN     stores AS s ON s.store_id = o.store_id
WHERE    o.order_date >= '2025-01-01'
  AND    o.order_date <  '2026-01-01'
GROUP BY s.country_name
ORDER BY orders DESC, s.country_name;`),
W('joins', 'lab', 5, 'Netherlands customers who have placed at least one order, with how many each has placed: customer_id, first_name, last_name, orders. Customers who never ordered do not belong. Most first, then customer_id.',
  ['One row: one customer. customers → orders, and since customers with no orders are not wanted, an INNER JOIN does the filtering for you.', 'The country test is on the customer\'s country_name, not the store\'s.'],
  `SELECT   c.customer_id, c.first_name, c.last_name, COUNT(*) AS orders
FROM     customers AS c
JOIN     orders    AS o ON o.customer_id = c.customer_id
WHERE    c.country_name = 'Netherlands'
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY orders DESC, c.customer_id;`),
W('joins', 'lab', 6, 'Revenue by store country for every year: the store\'s country_name, the year from calendar, revenue (2 decimals). Sort by country_name, then year.',
  ['One row: one country in one year. order_lines → orders → stores, plus orders → calendar on order_date = calendar_date for the year.', 'Four tables; calendar is there only for its year column (EXTRACT(YEAR FROM o.order_date) would also work, but the question says from calendar).'],
  `SELECT   s.country_name, cal.year,
         ROUND(SUM(ol.quantity * ol.net_price), 2) AS revenue
FROM     order_lines AS ol
JOIN     orders      AS o   ON o.order_id        = ol.order_id
JOIN     stores      AS s   ON s.store_id        = o.store_id
JOIN     calendar    AS cal ON cal.calendar_date = o.order_date
GROUP BY s.country_name, cal.year
ORDER BY s.country_name, cal.year;`),
W('joins', 'lab', 7, 'The ten customers with the highest lifetime revenue: customer_id, first_name, last_name, revenue (2 decimals). Highest first, then customer_id. Ten rows.',
  ['One row: one customer. customers → orders → order_lines, and the money is on the lines.', 'Group by the key and the names; the names do not split the groups.'],
  `SELECT   c.customer_id, c.first_name, c.last_name,
         ROUND(SUM(ol.quantity * ol.net_price), 2) AS revenue
FROM     customers   AS c
JOIN     orders      AS o  ON o.customer_id = c.customer_id
JOIN     order_lines AS ol ON ol.order_id   = o.order_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY revenue DESC, c.customer_id
LIMIT    10;`),
W('joins', 'lab', 8, 'All 74 stores with the number of orders each took in 2025. Stores with no 2025 orders must appear with 0. store_id, country_name, orders; most first, then store_id. 74 rows.',
  ['"All 74 stores … must appear" means start from stores with a LEFT JOIN to orders.', 'Trap: the 2025 test must be in ON, not WHERE, or the stores with no 2025 orders are dropped.', 'COUNT(o.order_id), never COUNT(*), so the unmatched stores show 0.'],
  `SELECT   s.store_id, s.country_name, COUNT(o.order_id) AS orders
FROM     stores AS s
LEFT JOIN orders AS o
       ON o.store_id = s.store_id
      AND o.order_date >= '2025-01-01'
      AND o.order_date <  '2026-01-01'
GROUP BY s.store_id, s.country_name
ORDER BY orders DESC, s.store_id;`),
W('joins', 'lab', 9, 'Starting from calendar, every date from 1 January 2017 through 31 December 2025 on which no orders were placed. One column, calendar_date, sorted.',
  ['One row: one day. Anti-join from calendar to orders on order_date = calendar_date.', 'The date range tests the left table (calendar), so it is safe in WHERE. The IS NULL test is on the right table\'s key.'],
  `SELECT   cal.calendar_date
FROM     calendar AS cal
LEFT JOIN orders  AS o ON o.order_date = cal.calendar_date
WHERE    cal.calendar_date >= '2017-01-01'
  AND    cal.calendar_date <  '2026-01-01'
  AND    o.order_id IS NULL
ORDER BY cal.calendar_date;`),
W('joins', 'lab', 10, 'For orders placed in 2025, return working_day and revenue (2 decimals). Two rows.',
  ['One row: one value of working_day (true, false). working_day is on calendar; revenue on the lines.', 'orders → calendar for the flag; orders → order_lines for the money. Filter 2025 in WHERE.'],
  `SELECT   cal.working_day,
         ROUND(SUM(ol.quantity * ol.net_price), 2) AS revenue
FROM     orders      AS o
JOIN     calendar    AS cal ON cal.calendar_date = o.order_date
JOIN     order_lines AS ol  ON ol.order_id       = o.order_id
WHERE    o.order_date >= '2025-01-01'
  AND    o.order_date <  '2026-01-01'
GROUP BY cal.working_day;`),
W('joins', 'lab', 11, 'For each category, how many different orders included at least one product from it, and what revenue did it bring in? category_name, orders, revenue (2 decimals); most orders first, then category_name.',
  ['One row: one category, over line rows. An order with three lines in one category would be counted three times by COUNT(*).', 'COUNT(DISTINCT ol.order_id) counts each order once per category. Revenue is still a plain SUM over lines.'],
  `SELECT   p.category_name,
         COUNT(DISTINCT ol.order_id)               AS orders,
         ROUND(SUM(ol.quantity * ol.net_price), 2) AS revenue
FROM     order_lines AS ol
JOIN     products    AS p ON p.product_id = ol.product_id
GROUP BY p.category_name
ORDER BY orders DESC, p.category_name;`),
W('joins', 'lab', 12, 'How many customers in each customer country have never placed an order? country_name and the count; most first, then country_name.',
  ['One row: one customer country. The customers who never ordered are an anti-join from customers to orders.', 'Then group the survivors by country. COUNT(*) is fine here because every surviving row is one customer with no order.'],
  `SELECT   c.country_name, COUNT(*) AS never_ordered
FROM     customers AS c
LEFT JOIN orders   AS o ON o.customer_id = c.customer_id
WHERE    o.order_id IS NULL
GROUP BY c.country_name
ORDER BY never_ordered DESC, c.country_name;`, 'The site\'s sample only holds customers who appear on sampled orders, so here it returns 0 rows; the full database has many.'),
W('joins', 'lab', 13, 'For each customer country: country_name, customers on file, orders they placed, and orders per customer (2 decimals). Every customer counts, including those who never ordered. Sort by orders per customer highest first, then country_name.',
  ['Every customer must count, so LEFT JOIN customers to orders.', 'After the join a customer with orders repeats once per order: COUNT(DISTINCT c.customer_id) for customers, COUNT(o.order_id) for orders (0 for none).', 'Trap: count divided by count is integer division; cast one side to numeric.'],
  `SELECT   c.country_name,
         COUNT(DISTINCT c.customer_id) AS customers,
         COUNT(o.order_id)             AS orders,
         ROUND(CAST(COUNT(o.order_id) AS numeric) / COUNT(DISTINCT c.customer_id), 2)
                                       AS orders_per_customer
FROM     customers AS c
LEFT JOIN orders   AS o ON o.customer_id = c.customer_id
GROUP BY c.country_name
ORDER BY orders_per_customer DESC, c.country_name;`),
W('joins', 'lab', 14, 'For 2025 orders, convert each line\'s revenue from dollars into the order\'s currency_code at the rate on the order\'s date. exchange_rates has one row per currency pair per day, so three columns find one row. Return currency_code and converted revenue (2 decimals), sorted by currency_code.',
  ['One row: one currency. orders → order_lines for the money; orders → exchange_rates on a three-column key: rate_date = order_date, from_currency = \'USD\', to_currency = currency_code.', 'A composite key needs every column in the ON, joined with AND. Leave one out and the join fans out to every pair on that day.', 'Convert row by row (× rate), then SUM.'],
  `SELECT   o.currency_code,
         ROUND(SUM(ol.quantity * ol.net_price * er.rate), 2) AS revenue
FROM     orders         AS o
JOIN     order_lines    AS ol ON ol.order_id      = o.order_id
JOIN     exchange_rates AS er ON er.rate_date     = o.order_date
                             AND er.from_currency = 'USD'
                             AND er.to_currency   = o.currency_code
WHERE    o.order_date >= '2025-01-01'
  AND    o.order_date <  '2026-01-01'
GROUP BY o.currency_code
ORDER BY o.currency_code;`),
W('joins', 'lab', 15, 'Which ten stores have the highest average order value (total revenue divided by number of orders)? store_id, country_name, orders, average order value (2 decimals). Highest first, then store_id. Ten rows.',
  ['One row: one store, over line rows. The number of orders must be COUNT(DISTINCT o.order_id): COUNT(*) would count lines and shrink the average. This is the "average off by eight dollars" fan-out.', 'Revenue is SUM over lines; divide by the distinct order count.'],
  `SELECT   s.store_id, s.country_name,
         COUNT(DISTINCT o.order_id) AS orders,
         ROUND(SUM(ol.quantity * ol.net_price) / COUNT(DISTINCT o.order_id), 2) AS avg_order_value
FROM     stores      AS s
JOIN     orders      AS o  ON o.store_id  = s.store_id
JOIN     order_lines AS ol ON ol.order_id = o.order_id
GROUP BY s.store_id, s.country_name
ORDER BY avg_order_value DESC, s.store_id
LIMIT    10;`),

/* ================= SHAPING: practice set ================= */
W('shaping', 'practice', 1, 'Films per length band: Under 1 hour (< 60), 1 to 2 hours (< 120), 2 hours or more. length_band and films, shortest band first.',
  ['A CASE turns the number into a label; GROUP BY the label counts each band.', 'WHENs in increasing order so the first match is the right one; ELSE catches the rest.', 'ORDER BY MIN(length) puts the bands in length order; ORDER BY length_band would sort the text and put "1 to 2 hours" first.'],
  `SELECT   CASE
           WHEN length < 60  THEN 'Under 1 hour'
           WHEN length < 120 THEN '1 to 2 hours'
           ELSE '2 hours or more'
         END AS length_band,
         COUNT(*) AS films
FROM     film
GROUP BY length_band
ORDER BY MIN(length);`, '96 · 438 · 466'),
W('shaping', 'practice', 2, 'The first ten films by title with a price tier: Budget (< 1), Standard (< 3), Premium.',
  ['CASE as a plain column, no grouping.', 'The second WHEN does not need rental_rate >= 1: any rate below 1 was already claimed by the first.'],
  `SELECT   title, rental_rate,
         CASE
           WHEN rental_rate < 1 THEN 'Budget'
           WHEN rental_rate < 3 THEN 'Standard'
           ELSE 'Premium'
         END AS price_tier
FROM     film
ORDER BY title
LIMIT    10;`),
W('shaping', 'practice', 3, 'Customer 780\'s rentals: rental_id, rented_on (a date), and returned_on showing the return date or \'Not returned\'. COALESCE(return_date, \'Not returned\') fails. Why, and fix.',
  ['COALESCE returns one type. Its first argument is a date, so PostgreSQL tries to read \'Not returned\' as a date: invalid input syntax for type date.', 'CAST the date to text first; then both arguments are text.', 'CAST(rental_date AS date) turns the timestamp into a day.'],
  `SELECT   rental_id,
         CAST(rental_date AS date) AS rented_on,
         COALESCE(CAST(CAST(return_date AS date) AS text), 'Not returned') AS returned_on
FROM     rental
WHERE    customer_id = 780
ORDER BY rental_date, rental_id;`, '8 rows; the two most recent are Not returned.'),
W('shaping', 'practice', 4, 'Rentals per month in 2025: month as a date and rentals, sorted by month.',
  ['DATE_TRUNC(\'month\', …) rolls each timestamp to the start of its month; it returns a timestamp, so CAST to date.', 'Half-open range for the year; GROUP BY the alias (PostgreSQL allows it).'],
  `SELECT   CAST(DATE_TRUNC('month', rental_date) AS date) AS month,
         COUNT(*) AS rentals
FROM     rental
WHERE    rental_date >= '2025-01-01'
  AND    rental_date <  '2026-01-01'
GROUP BY month
ORDER BY month;`, '12 rows.'),
W('shaping', 'practice', 5, 'Rentals by hour of the day: hour and rentals, sorted by hour.',
  ['EXTRACT(HOUR FROM rental_date) pulls one part out of the timestamp.', 'The hour depends on the session\'s time zone, which is why SET TIME ZONE \'UTC\' matters.'],
  `SELECT   EXTRACT(HOUR FROM rental_date) AS hour,
         COUNT(*) AS rentals
FROM     rental
GROUP BY hour
ORDER BY hour;`, '24 rows.'),
W('shaping', 'practice', 6, 'For customer 780\'s returned rentals: rental_id, rental_date, return_date, time_kept (an interval) and days_kept (calendar days).',
  ['Timestamp minus timestamp is an interval, exact to the second.', 'Date minus date is a whole number of calendar dates apart: out at 9 p.m. on 29 October, back just after midnight on 6 November is 8, even though the film was out 7 days 4 hours.', 'Only returned rentals: return_date IS NOT NULL.'],
  `SELECT   rental_id, rental_date, return_date,
         return_date - rental_date                             AS time_kept,
         CAST(return_date AS date) - CAST(rental_date AS date) AS days_kept
FROM     rental
WHERE    customer_id = 780
  AND    return_date IS NOT NULL
ORDER BY rental_date, rental_id;`),
W('shaping', 'practice', 7, 'New customers per year: year and new_customers, sorted by year.',
  ['EXTRACT(YEAR FROM create_date); create_date is a plain date so no time zone is involved.'],
  `SELECT   EXTRACT(YEAR FROM create_date) AS year,
         COUNT(*) AS new_customers
FROM     customer
GROUP BY year
ORDER BY year;`, '2022 689 · 2023 95 · 2024 88 · 2025 91 · 2026 36'),
W('shaping', 'practice', 8, 'Payments and revenue per amount band: Free (= 0), Under $3, $3 to $5.99, $6 and up. Lowest band first.',
  ['Free must be tested before Under $3, because 0 is also under 3: most specific first.', 'Two aggregates per band; ORDER BY MIN(amount) keeps the bands in money order.'],
  `SELECT   CASE
           WHEN amount = 0 THEN 'Free'
           WHEN amount < 3 THEN 'Under $3'
           WHEN amount < 6 THEN '$3 to $5.99'
           ELSE '$6 and up'
         END AS amount_band,
         COUNT(*)    AS payments,
         SUM(amount) AS revenue
FROM     payment
GROUP BY amount_band
ORDER BY MIN(amount);`, '24 · 30,626 · 17,760 · 2,651'),
W('shaping', 'practice', 9, 'Rentals per year with a column per store: year, store_1, store_2, total. Sorted by year.',
  ['One row per year from GROUP BY; one column per store from a CASE inside each COUNT.', 'COUNT(CASE WHEN i.store_id = 1 THEN 1 END) has no ELSE, so rows from the other store are NULL and not counted.', 'The store is on inventory: rental → inventory.'],
  `SELECT   EXTRACT(YEAR FROM r.rental_date) AS year,
         COUNT(CASE WHEN i.store_id = 1 THEN 1 END) AS store_1,
         COUNT(CASE WHEN i.store_id = 2 THEN 1 END) AS store_2,
         COUNT(*) AS total
FROM     rental r
JOIN     inventory i ON i.inventory_id = r.inventory_id
GROUP BY year
ORDER BY year;`),
W('shaping', 'practice', 10, 'Films per genre with a column per rating (g, pg, pg_13, r, nc_17) and a total. Sorted by category.',
  ['Conditional aggregation with five CASE columns; GROUP BY c.name makes the rows.', 'Each row\'s five columns add up to its total. The totals add to more than 1,000 because a film can be in more than one genre.'],
  `SELECT   c.name AS category,
         COUNT(CASE WHEN f.rating = 'G'     THEN 1 END) AS g,
         COUNT(CASE WHEN f.rating = 'PG'    THEN 1 END) AS pg,
         COUNT(CASE WHEN f.rating = 'PG-13' THEN 1 END) AS pg_13,
         COUNT(CASE WHEN f.rating = 'R'     THEN 1 END) AS r,
         COUNT(CASE WHEN f.rating = 'NC-17' THEN 1 END) AS nc_17,
         COUNT(*) AS total
FROM     film f
JOIN     film_category fc ON fc.film_id = f.film_id
JOIN     category c       ON c.category_id = fc.category_id
GROUP BY c.name
ORDER BY c.name;`),
W('shaping', 'practice', 11, 'Average calendar days kept, by rating: rating, rentals, avg_days_kept (2 decimals).',
  ['Days kept is date minus date; AVG of whole numbers gives a decimal.', 'rental → inventory → film for the rating.', 'return_date IS NOT NULL is optional (AVG skips NULLs) but makes the intent plain and keeps the rentals count honest.'],
  `SELECT   f.rating,
         COUNT(*) AS rentals,
         ROUND(AVG(CAST(r.return_date AS date) - CAST(r.rental_date AS date)), 2) AS avg_days_kept
FROM     rental r
JOIN     inventory i ON i.inventory_id = r.inventory_id
JOIN     film f      ON f.film_id = i.film_id
WHERE    r.return_date IS NOT NULL
GROUP BY f.rating
ORDER BY f.rating;`),
W('shaping', 'practice', 12, 'Every rental not yet returned, with days out as of 28 July 2026: rental_id, title, first_name, last_name, days_out. Fewest days first, then rental_id.',
  ['DATE \'2026-07-28\' is today for this data; minus a date gives whole days.', 'Not returned is return_date IS NULL. Film via inventory; customer directly.', 'Watch: 183 of the 241 have been out over a year, 182 since the first day in the data. Those copies are lost, not late; a report should say so rather than average them in.'],
  `SELECT   r.rental_id, f.title, cu.first_name, cu.last_name,
         DATE '2026-07-28' - CAST(r.rental_date AS date) AS days_out
FROM     rental r
JOIN     inventory i ON i.inventory_id = r.inventory_id
JOIN     film f      ON f.film_id = i.film_id
JOIN     customer cu ON cu.customer_id = r.customer_id
WHERE    r.return_date IS NULL
ORDER BY days_out, r.rental_id;`, '241 rows.'),
W('shaping', 'practice', 13, 'Late returns and their share by rating: rating, rentals, late (days kept > rental_duration), pct_late (1 decimal).',
  ['COUNT(CASE … THEN 1 END) counts only the late rows.', '100.0 makes the division decimal; 100 would give whole numbers through integer division.'],
  `SELECT   f.rating,
         COUNT(*) AS rentals,
         COUNT(CASE WHEN CAST(r.return_date AS date) - CAST(r.rental_date AS date)
                         > f.rental_duration THEN 1 END) AS late,
         ROUND(100.0 * COUNT(CASE WHEN CAST(r.return_date AS date) - CAST(r.rental_date AS date)
                                       > f.rental_duration THEN 1 END)
               / COUNT(*), 1) AS pct_late
FROM     rental r
JOIN     inventory i ON i.inventory_id = r.inventory_id
JOIN     film f      ON f.film_id = i.film_id
WHERE    r.return_date IS NOT NULL
GROUP BY f.rating
ORDER BY f.rating;`, 'About 44% late in every rating.'),
W('shaping', 'practice', 14, 'In one row from address: addresses, with_address2 (not NULL), with_real_address2 (not NULL and not empty).',
  ['COUNT(address2) counts every value that is not NULL, and \'\' is not NULL: 999.', 'NULLIF(address2, \'\') turns \'\' into NULL, so COUNT then skips it: 0.'],
  `SELECT   COUNT(*)                    AS addresses,
         COUNT(address2)             AS with_address2,
         COUNT(NULLIF(address2, '')) AS with_real_address2
FROM     address;`, '1003 · 999 · 0'),
W('shaping', 'practice', 15, 'Genres by their share of films with no copies: category, films, not_stocked, pct_not_stocked (1 decimal); highest share first, then category.',
  ['category → film_category → film, then LEFT JOIN inventory so films with no copies survive with NULL inventory_id.', 'Joining inventory multiplies each stocked film by its copies, so both counts need DISTINCT: COUNT(DISTINCT f.film_id) and COUNT(DISTINCT CASE WHEN i.inventory_id IS NULL THEN f.film_id END).', '100.0 avoids integer division.'],
  `SELECT   c.name AS category,
         COUNT(DISTINCT f.film_id) AS films,
         COUNT(DISTINCT CASE WHEN i.inventory_id IS NULL THEN f.film_id END) AS not_stocked,
         ROUND(100.0 * COUNT(DISTINCT CASE WHEN i.inventory_id IS NULL THEN f.film_id END)
               / COUNT(DISTINCT f.film_id), 1) AS pct_not_stocked
FROM     category c
JOIN     film_category fc ON fc.category_id = c.category_id
JOIN     film f           ON f.film_id = fc.film_id
LEFT JOIN inventory i     ON i.film_id = f.film_id
GROUP BY c.name
ORDER BY pct_not_stocked DESC, c.name;`),
W('shaping', 'practice', 16, 'March 2025 payments and revenue. BETWEEN \'2025-03-01\' AND \'2025-03-31\' gives 728 payments; the right answer is 751. Explain and fix.',
  ['payment_date is a timestamp. \'2025-03-31\' against a timestamp means midnight at the start of 31 March, so every payment made during that day is left out.', 'Use >= start AND < next start. BETWEEN is safe only on a column that holds plain dates.'],
  `SELECT   COUNT(*)    AS payments,
         SUM(amount) AS revenue
FROM     payment
WHERE    payment_date >= '2025-03-01'
  AND    payment_date <  '2025-04-01';`, '751 · 2,235.49'),
W('shaping', 'practice', 17, 'The share of rentals never returned, per store. The percentage comes back 0. Explain and fix.',
  ['Every value in the percentage is an integer: counts divided by counts. 12,600 / 25,761 is 0 remainder 12,600 and the remainder is dropped.', 'CAST one side to numeric before dividing (or multiply by 100.0).', 'not_returned is COUNT(*) − COUNT(return_date), because COUNT(col) skips the NULLs.'],
  `SELECT   i.store_id,
         COUNT(*) AS rentals,
         COUNT(*) - COUNT(r.return_date) AS not_returned,
         ROUND(100 * CAST(COUNT(*) - COUNT(r.return_date) AS numeric) / COUNT(*), 2)
           AS pct_not_returned
FROM     rental r
JOIN     inventory i ON i.inventory_id = r.inventory_id
GROUP BY i.store_id
ORDER BY i.store_id;`, '0.49% and 0.44%.'),
W('shaping', 'practice', 18, 'Payment bands with WHEN amount < 6 first, then < 3, then = 0: the Under $3 and Free bands come back empty. Explain and fix.',
  ['First match wins. Every amount under 3 is also under 6, so the first WHEN claims it and the other branches are never reached.', 'Order the WHENs from the most specific test to the least: = 0, < 3, < 6, ELSE.'],
  `SELECT   CASE
           WHEN amount = 0 THEN 'Free'
           WHEN amount < 3 THEN 'Under $3'
           WHEN amount < 6 THEN '$3 to $5.99'
           ELSE '$6 and up'
         END AS amount_band,
         COUNT(*) AS payments
FROM     payment
GROUP BY amount_band
ORDER BY MIN(amount);`),
W('shaping', 'practice', 19, 'Late returns per store with COUNT(CASE WHEN … THEN 1 ELSE 0 END): late equals returned on every row. Explain and fix.',
  ['COUNT counts every value that is not NULL, and 0 is not NULL, so ELSE 0 makes every row count.', 'Either drop the ELSE (misses become NULL and COUNT skips them) or keep ELSE 0 and change COUNT to SUM, which adds the 1s and 0s.'],
  `SELECT   i.store_id,
         COUNT(*) AS returned,
         COUNT(CASE WHEN CAST(r.return_date AS date) - CAST(r.rental_date AS date)
                         > f.rental_duration THEN 1 END) AS late
FROM     rental r
JOIN     inventory i ON i.inventory_id = r.inventory_id
JOIN     film f      ON f.film_id = i.film_id
WHERE    r.return_date IS NOT NULL
GROUP BY i.store_id
ORDER BY i.store_id;`, '11,250 and 11,302 late.'),
W('shaping', 'practice', 20, 'The March 2025 query from P16 gives a different count on a colleague\'s machine in New York. Make the date range independent of the session\'s time zone.',
  ['The query is right; the time zone differs. \'2025-03-01\' is read as midnight in the session\'s zone, so in New York March starts five hours later than in UTC and payments in those hours move between months.', 'A TIMESTAMPTZ literal with +00 fixes the instant whatever the session zone; so does SET TIME ZONE \'UTC\'.'],
  `SELECT   COUNT(*)    AS payments,
         SUM(amount) AS revenue
FROM     payment
WHERE    payment_date >= TIMESTAMPTZ '2025-03-01 00:00:00+00'
  AND    payment_date <  TIMESTAMPTZ '2025-04-01 00:00:00+00';`),

/* ================= SHAPING: lecture ================= */
W('shaping', 'lecture', 1, 'How many orders did each region place in each month? One row per region, a column per month.',
  ['GROUP BY region makes the rows; a COUNT(CASE …) per month makes the columns.', 'No ELSE, so the misses are NULL and not counted. The month tests use half-open ranges.'],
  `SELECT region,
  COUNT(CASE WHEN order_date < '2026-02-01' THEN 1 END) AS jan,
  COUNT(CASE WHEN order_date >= '2026-02-01' AND order_date < '2026-03-01' THEN 1 END) AS feb,
  COUNT(CASE WHEN order_date >= '2026-03-01' THEN 1 END) AS mar
FROM lecture.orders
GROUP BY region ORDER BY region;`),
W('shaping', 'lecture', 2, 'List every customer with the total units they bought, showing 0 for those who bought none.',
  ['"Every customer … 0 for none": LEFT JOIN from customers through orders to order_items, LEFT at every step.', 'SUM over no rows is NULL; COALESCE(SUM(oi.units), 0) writes the true zero.'],
  `SELECT c.first_name, c.last_name,
       COALESCE(SUM(oi.units), 0) AS units
FROM   lecture.customers AS c
LEFT JOIN lecture.orders o       ON o.customer_id = c.customer_id
LEFT JOIN lecture.order_items oi ON oi.order_id = o.order_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY units DESC;`, '40 rows: Ellis Bianchi 220 … the Doyles 0.'),
W('shaping', 'lecture', 3, 'Label every customer by days since their last order as of 31 March 2026: Active (30 or fewer), Lapsing (31–60), Lapsed (over 60), or Never ordered.',
  ['Every customer: LEFT JOIN to orders. The last order is MAX(o.order_date) per customer, so GROUP BY the customer and put the CASE around the aggregate.', 'Trap: where do the customers with no orders land? MAX is NULL for them, and DATE − NULL is NULL, which matches no <= test and would fall into ELSE \'Lapsed\'. Test IS NULL first.', 'Most specific first after that: <= 30, then <= 60, ELSE Lapsed.'],
  `SELECT c.first_name, c.last_name,
  CASE
    WHEN MAX(o.order_date) IS NULL THEN 'Never ordered'
    WHEN DATE '2026-03-31' - MAX(o.order_date) <= 30 THEN 'Active'
    WHEN DATE '2026-03-31' - MAX(o.order_date) <= 60 THEN 'Lapsing'
    ELSE 'Lapsed'
  END AS status
FROM   lecture.customers AS c
LEFT JOIN lecture.orders AS o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY status, c.last_name;`, 'Active 28 · Lapsing 8 · Lapsed 2 · Never ordered 2'),

/* ================= SHAPING: lab ================= */
W('shaping', 'lab', 1, 'Put each product into a band by unit_price: \'Under $100\', \'$100 to $499.99\', \'$500 and up\'. Return the band and the number of products. Sort from lowest price to highest, not alphabetically.',
  ['CASE with WHENs in increasing order and an ELSE; GROUP BY the band.', 'ORDER BY MIN(unit_price) sorts by money. Labels must match exactly.'],
  `SELECT   CASE
           WHEN unit_price < 100 THEN 'Under $100'
           WHEN unit_price < 500 THEN '$100 to $499.99'
           ELSE '$500 and up'
         END AS price_band,
         COUNT(*) AS products
FROM     products
GROUP BY price_band
ORDER BY MIN(unit_price);`),
W('shaping', 'lab', 2, 'Every store\'s floor area, showing 0 for the online store whose floor_area_m2 is blank. store_id, country_name, floor area. Sort by store_id. 74 rows.',
  ['COALESCE(floor_area_m2, 0): the replacement is true, the online store has no floor.'],
  `SELECT   store_id, country_name,
         COALESCE(floor_area_m2, 0) AS floor_area_m2
FROM     stores
ORDER BY store_id;`),
W('shaping', 'lab', 3, 'How many orders were placed in each month of 2025? The month as a date (first day of the month) and the number of orders. 12 rows.',
  ['CAST(DATE_TRUNC(\'month\', order_date) AS date) for a date, not a timestamp.', 'Filter 2025 in WHERE, GROUP BY month.'],
  `SELECT   CAST(DATE_TRUNC('month', order_date) AS date) AS month,
         COUNT(*) AS orders
FROM     orders
WHERE    order_date >= '2025-01-01'
  AND    order_date <  '2026-01-01'
GROUP BY month
ORDER BY month;`),
W('shaping', 'lab', 4, 'For 2025 orders, the day of the week as a number (0 Sunday … 6 Saturday) and the number of orders, sorted by the day number.',
  ['EXTRACT(DOW FROM order_date) gives PostgreSQL\'s numbering.'],
  `SELECT   EXTRACT(DOW FROM order_date) AS weekday,
         COUNT(*) AS orders
FROM     orders
WHERE    order_date >= '2025-01-01'
  AND    order_date <  '2026-01-01'
GROUP BY weekday
ORDER BY weekday;`),
W('shaping', 'lab', 5, 'For online orders placed in 2025, how many days passed between order_date and delivery_date? The number of days and the number of orders that took that long, sorted by days.',
  ['Online means store_id = 999999. Both columns are dates, so delivery_date − order_date is a whole number of days.', 'GROUP BY that difference.'],
  `SELECT   delivery_date - order_date AS days,
         COUNT(*) AS orders
FROM     orders
WHERE    store_id = 999999
  AND    order_date >= '2025-01-01'
  AND    order_date <  '2026-01-01'
GROUP BY days
ORDER BY days;`),
W('shaping', 'lab', 6, 'Put every order line into a discount band: \'No discount\' when net_price = unit_price, \'Under 10%\' when the discount is above zero but under 10 percent, \'10% or more\' otherwise. Band, number of lines, revenue (2 decimals). Sort from smallest discount to largest.',
  ['Most specific first: equality, then the under-10% range, ELSE the rest. The discount is (unit_price − net_price) / unit_price.', 'Sort by MIN of the discount expression so the bands come out in discount order.'],
  `SELECT   CASE
           WHEN net_price = unit_price THEN 'No discount'
           WHEN (unit_price - net_price) / unit_price < 0.10 THEN 'Under 10%'
           ELSE '10% or more'
         END AS discount_band,
         COUNT(*) AS lines,
         ROUND(SUM(quantity * net_price), 2) AS revenue
FROM     order_lines
GROUP BY discount_band
ORDER BY MIN((unit_price - net_price) / unit_price);`),
W('shaping', 'lab', 7, 'One row per store country with revenue for 2023, 2024 and 2025 as three columns (2 decimals). Sort by country_name. 9 rows.',
  ['GROUP BY country makes the rows; SUM(CASE WHEN year = … THEN revenue ELSE 0 END) makes each column.', 'order_lines → orders → stores. Filter to the three years in WHERE so fewer rows are grouped.'],
  `SELECT   s.country_name,
         ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM o.order_date) = 2023 THEN ol.quantity * ol.net_price ELSE 0 END), 2) AS revenue_2023,
         ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM o.order_date) = 2024 THEN ol.quantity * ol.net_price ELSE 0 END), 2) AS revenue_2024,
         ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM o.order_date) = 2025 THEN ol.quantity * ol.net_price ELSE 0 END), 2) AS revenue_2025
FROM     order_lines AS ol
JOIN     orders      AS o ON o.order_id = ol.order_id
JOIN     stores      AS s ON s.store_id = o.store_id
WHERE    o.order_date >= '2023-01-01'
  AND    o.order_date <  '2026-01-01'
GROUP BY s.country_name
ORDER BY s.country_name;`),
W('shaping', 'lab', 8, 'For every store, how many days was it open? A closed store from opened_on to closed_on; an open store to DATE \'2026-04-20\'. store_id, country_name, opened_on, closed_on (blank where blank), days open. Most first, then store_id. 74 rows.',
  ['COALESCE(closed_on, DATE \'2026-04-20\') gives the end date; minus opened_on is whole days.', 'Show closed_on itself unchanged: the question wants the blank kept there.'],
  `SELECT   store_id, country_name, opened_on, closed_on,
         COALESCE(closed_on, DATE '2026-04-20') - opened_on AS days_open
FROM     stores
ORDER BY days_open DESC, store_id;`),
W('shaping', 'lab', 9, 'Starting from calendar, every date from 1 to 29 February 2024 with the number of orders that day; a day with no orders shows 0. 29 rows.',
  ['calendar LEFT JOIN orders on order_date = calendar_date; the date range tests the left table so it is safe in WHERE.', 'COUNT(o.order_id), not COUNT(*), so empty days are 0.'],
  `SELECT   cal.calendar_date, COUNT(o.order_id) AS orders
FROM     calendar AS cal
LEFT JOIN orders  AS o ON o.order_date = cal.calendar_date
WHERE    cal.calendar_date >= '2024-02-01'
  AND    cal.calendar_date <  '2024-03-01'
GROUP BY cal.calendar_date
ORDER BY cal.calendar_date;`),
W('shaping', 'lab', 10, 'For each category: category_name, products, products with a weight recorded, products with no weight. Sort by the number with no weight most first, then category_name.',
  ['COUNT(*) is all; COUNT(weight) skips NULLs; the difference is the missing ones.'],
  `SELECT   category_name,
         COUNT(*)                 AS products,
         COUNT(weight)            AS with_weight,
         COUNT(*) - COUNT(weight) AS no_weight
FROM     products
GROUP BY category_name
ORDER BY no_weight DESC, category_name;`),
W('shaping', 'lab', 11, 'For online orders in 2025: the month (as a date), the number of orders, and the average days from order_date to delivery_date (2 decimals). Sort by month. 12 rows.',
  ['Same month expression as Q3; AVG of a date difference (whole days) gives a decimal.'],
  `SELECT   CAST(DATE_TRUNC('month', order_date) AS date) AS month,
         COUNT(*) AS orders,
         ROUND(AVG(delivery_date - order_date), 2) AS avg_days
FROM     orders
WHERE    store_id = 999999
  AND    order_date >= '2025-01-01'
  AND    order_date <  '2026-01-01'
GROUP BY month
ORDER BY month;`),
W('shaping', 'lab', 12, 'An online delivery is late when it arrives more than 7 days after the order. For each year of online orders: year, online orders, late ones, percentage late (1 decimal). Sort by year.',
  ['COUNT(CASE WHEN delivery_date − order_date > 7 THEN 1 END), no ELSE.', 'Trap: late / orders is integer division; 100.0 * … keeps the decimals.'],
  `SELECT   EXTRACT(YEAR FROM order_date) AS year,
         COUNT(*) AS orders,
         COUNT(CASE WHEN delivery_date - order_date > 7 THEN 1 END) AS late,
         ROUND(100.0 * COUNT(CASE WHEN delivery_date - order_date > 7 THEN 1 END) / COUNT(*), 1) AS pct_late
FROM     orders
WHERE    store_id = 999999
GROUP BY year
ORDER BY year;`),
W('shaping', 'lab', 13, 'Every customer whose state_name is Waverley with lifetime revenue (2 decimals); customers who never ordered must appear with 0. customer_id, first_name, last_name, revenue; highest first, then customer_id. 36 rows.',
  ['"Must appear with 0": LEFT JOIN customers → orders → order_lines, LEFT at both steps.', 'The state test is on the left table, so WHERE is safe.', 'COALESCE(SUM(…), 0) writes the true zero; round inside or outside, the zero stays 0.'],
  `SELECT   c.customer_id, c.first_name, c.last_name,
         COALESCE(ROUND(SUM(ol.quantity * ol.net_price), 2), 0) AS revenue
FROM     customers   AS c
LEFT JOIN orders      AS o  ON o.customer_id = c.customer_id
LEFT JOIN order_lines AS ol ON ol.order_id   = o.order_id
WHERE    c.state_name = 'Waverley'
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY revenue DESC, c.customer_id;`),
W('shaping', 'lab', 14, 'All 74 stores with average order value for January through March 2026 (revenue / orders, 2 decimals). A store with no orders shows 0 orders and a blank average, and the query must not fail. Sort by average highest first, blanks at the end, then store_id.',
  ['Every store: LEFT JOIN stores → orders with the date range in ON, then LEFT JOIN order_lines.', 'Orders are COUNT(DISTINCT o.order_id) because lines fan out. Divide by NULLIF(…, 0) so a store with no orders gets NULL instead of an error.', 'ORDER BY avg DESC NULLS LAST puts the blanks at the end (DESC alone would put NULLs first).'],
  `SELECT   s.store_id, s.country_name,
         COUNT(DISTINCT o.order_id) AS orders,
         ROUND(SUM(ol.quantity * ol.net_price) / NULLIF(COUNT(DISTINCT o.order_id), 0), 2) AS avg_order_value
FROM     stores      AS s
LEFT JOIN orders      AS o  ON o.store_id = s.store_id
                           AND o.order_date >= '2026-01-01'
                           AND o.order_date <  '2026-04-01'
LEFT JOIN order_lines AS ol ON ol.order_id = o.order_id
GROUP BY s.store_id, s.country_name
ORDER BY avg_order_value DESC NULLS LAST, s.store_id;`),
W('shaping', 'lab', 15, 'For each month of 2025: month (as a date), online revenue, in-store revenue, and online as a percentage of all revenue that month (1 decimal). Revenues to 2 decimals. 12 rows.',
  ['GROUP BY month; a CASE on store_id inside each SUM splits online (999999) from in-store.', 'The percentage is the online SUM over the total SUM, times 100.0, with NULLIF for safety.'],
  `SELECT   CAST(DATE_TRUNC('month', o.order_date) AS date) AS month,
         ROUND(SUM(CASE WHEN o.store_id = 999999  THEN ol.quantity * ol.net_price ELSE 0 END), 2) AS online,
         ROUND(SUM(CASE WHEN o.store_id <> 999999 THEN ol.quantity * ol.net_price ELSE 0 END), 2) AS in_store,
         ROUND(100.0 * SUM(CASE WHEN o.store_id = 999999 THEN ol.quantity * ol.net_price ELSE 0 END)
               / NULLIF(SUM(ol.quantity * ol.net_price), 0), 1) AS online_pct
FROM     orders      AS o
JOIN     order_lines AS ol ON ol.order_id = o.order_id
WHERE    o.order_date >= '2025-01-01'
  AND    o.order_date <  '2026-01-01'
GROUP BY month
ORDER BY month;`),

/* ================= MULTI-STEP: practice set ================= */
W('multi', 'practice', 1, 'How many films of each rating are longer than the average film? rating and films, sorted by rating.',
  ['The average length is one number (115.3), so a scalar subquery in parentheses can stand in for it.', 'It runs first; the outer query keeps the 489 films above it and counts them per rating.'],
  `SELECT   rating, COUNT(*) AS films
FROM     film
WHERE    length > (SELECT AVG(length) FROM film)
GROUP BY rating
ORDER BY rating;`),
W('multi', 'practice', 2, 'Which customers have paid more in total than the average customer? Build the total per customer in a WITH step, then compare each total with the average of those totals. customer_id, first_name, last_name, spend; highest first, then customer_id.',
  ['The average of the customers\' totals does not exist until the totals do: step 1 is a WITH that builds them.', 'The outer query reads spend twice: once for the rows, once inside the scalar subquery for their average.', 'More than half the customers (592) are above the average, because a few hundred small spenders pull it down.'],
  `WITH spend AS (
  SELECT   c.customer_id, c.first_name, c.last_name,
           SUM(p.amount) AS spend
  FROM     customer AS c
  JOIN     payment  AS p ON p.customer_id = c.customer_id
  GROUP BY c.customer_id, c.first_name, c.last_name
)
SELECT   customer_id, first_name, last_name, spend
FROM     spend
WHERE    spend > (SELECT AVG(spend) FROM spend)
ORDER BY spend DESC, customer_id;`, '592 rows.'),
W('multi', 'practice', 3, 'What share of all payment revenue does each genre bring in? category, revenue, pct_of_total (1 decimal), highest revenue first.',
  ['Group first, window second: a CTE makes one row per genre.', 'SUM(revenue) OVER () adds up the sixteen grouped rows without collapsing them, so each row can be divided by the total on the same line.'],
  `WITH by_category AS (
  SELECT   c.name AS category, SUM(p.amount) AS revenue
  FROM     payment       AS p
  JOIN     rental        AS r  ON r.rental_id     = p.rental_id
  JOIN     inventory     AS i  ON i.inventory_id  = r.inventory_id
  JOIN     film_category AS fc ON fc.film_id      = i.film_id
  JOIN     category      AS c  ON c.category_id   = fc.category_id
  GROUP BY c.name
)
SELECT   category, revenue,
         ROUND(100 * revenue / SUM(revenue) OVER (), 1) AS pct_of_total
FROM     by_category
ORDER BY revenue DESC;`),
W('multi', 'practice', 4, 'Rank the months of 2025 by number of rentals, busiest first: month (as a date), rentals, busy_rank; sorted by rank, then month.',
  ['Monthly CTE with DATE_TRUNC cast to date.', 'RANK() OVER (ORDER BY rentals DESC): the ORDER BY inside OVER says what to rank by; the query\'s own ORDER BY only sorts the output. No two months tie, so RANK, DENSE_RANK and ROW_NUMBER agree here.'],
  `WITH monthly AS (
  SELECT   CAST(DATE_TRUNC('month', rental_date) AS date) AS month,
           COUNT(*) AS rentals
  FROM     rental
  WHERE    rental_date >= '2025-01-01'
    AND    rental_date <  '2026-01-01'
  GROUP BY month
)
SELECT   month, rentals,
         RANK() OVER (ORDER BY rentals DESC) AS busy_rank
FROM     monthly
ORDER BY busy_rank, month;`, 'August 829 is busiest.'),
W('multi', 'practice', 5, 'For each month of 2025: month, rentals, prev_rentals, change (this minus previous). January\'s last two columns are blank.',
  ['LAG(rentals) OVER (ORDER BY month) copies the previous row\'s count; ORDER BY month inside OVER makes "previous row" mean "previous month".', 'January has no previous row, so its LAG is NULL and NULL minus anything is NULL: correct.'],
  `WITH monthly AS (
  SELECT   CAST(DATE_TRUNC('month', rental_date) AS date) AS month,
           COUNT(*) AS rentals
  FROM     rental
  WHERE    rental_date >= '2025-01-01'
    AND    rental_date <  '2026-01-01'
  GROUP BY month
)
SELECT   month, rentals,
         LAG(rentals) OVER (ORDER BY month)           AS prev_rentals,
         rentals - LAG(rentals) OVER (ORDER BY month) AS change
FROM     monthly
ORDER BY month;`),
W('multi', 'practice', 6, 'The same months looking forward: month, rentals, next_rentals. December\'s last column is blank.',
  ['LEAD is the mirror image of LAG: the row after. December is the last row, so its LEAD is NULL.'],
  `WITH monthly AS (
  SELECT   CAST(DATE_TRUNC('month', rental_date) AS date) AS month,
           COUNT(*) AS rentals
  FROM     rental
  WHERE    rental_date >= '2025-01-01'
    AND    rental_date <  '2026-01-01'
  GROUP BY month
)
SELECT   month, rentals,
         LEAD(rentals) OVER (ORDER BY month) AS next_rentals
FROM     monthly
ORDER BY month;`),
W('multi', 'practice', 7, 'For each month of 2025: month, revenue (payments made that month), running_total from January through that month.',
  ['Monthly CTE on payment_date.', 'The frame ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW says "from the first row through this one". December\'s running total is the year\'s revenue, 26,254.84.'],
  `WITH monthly AS (
  SELECT   CAST(DATE_TRUNC('month', payment_date) AS date) AS month,
           SUM(amount) AS revenue
  FROM     payment
  WHERE    payment_date >= '2025-01-01'
    AND    payment_date <  '2026-01-01'
  GROUP BY month
)
SELECT   month, revenue,
         SUM(revenue) OVER (ORDER BY month
                            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM     monthly
ORDER BY month;`),
W('multi', 'practice', 8, 'For each month of 2025 and each store: month, store_id, rentals, pct_of_month (that store\'s share of the month\'s rentals, 1 decimal). The store is inventory.store_id.',
  ['CTE: one row per month per store, via rental → inventory.', 'PARTITION BY month restarts the window for each month, so the two stores add up to 100.', 'rentals is an integer and so is its SUM: the 100.0 keeps the decimals, 100 would give 0 in every row.'],
  `WITH store_month AS (
  SELECT   CAST(DATE_TRUNC('month', r.rental_date) AS date) AS month,
           i.store_id,
           COUNT(*) AS rentals
  FROM     rental    AS r
  JOIN     inventory AS i ON i.inventory_id = r.inventory_id
  WHERE    r.rental_date >= '2025-01-01'
    AND    r.rental_date <  '2026-01-01'
  GROUP BY month, i.store_id
)
SELECT   month, store_id, rentals,
         ROUND(100.0 * rentals / SUM(rentals) OVER (PARTITION BY month), 1) AS pct_of_month
FROM     store_month
ORDER BY month, store_id;`),
W('multi', 'practice', 9, 'The three longest films in each genre, with DENSE_RANK so a tie does not use up a rank: category, title, length, length_rank. Some genres return more than three rows. Why?',
  ['No aggregate needed: rank straight over the joined film–genre rows, PARTITION BY c.name ORDER BY f.length DESC.', 'DENSE_RANK gives films that share a length the same rank with no gap, so rank 3 is the third-longest length and every film at it comes back: three ranks, not three rows.', 'The filter is in the outer query because WHERE cannot see a window in the query that computes it.'],
  `WITH ranked AS (
  SELECT   c.name AS category, f.title, f.length,
           DENSE_RANK() OVER (PARTITION BY c.name ORDER BY f.length DESC) AS length_rank
  FROM     film          AS f
  JOIN     film_category AS fc ON fc.film_id     = f.film_id
  JOIN     category      AS c  ON c.category_id  = fc.category_id
)
SELECT   category, title, length, length_rank
FROM     ranked
WHERE    length_rank <= 3
ORDER BY category, length_rank, title;`, '75 rows; Action has seven films across its top three lengths.'),
W('multi', 'practice', 10, 'The two customers with the most rentals at each store: store_id, customer_id, rentals, rn (1 or 2). Where two tie, the lower customer_id ranks first.',
  ['Top N per group: aggregate (rentals per store per customer); number within each store; keep the first two outside the CTE.', 'Store 2\'s leaders tie at 51, and ROW_NUMBER must still pick an order: customer_id in the ORDER BY decides it. Without the tie-breaker the result could change from one run to the next.'],
  `WITH store_customer AS (
  SELECT   i.store_id, r.customer_id, COUNT(*) AS rentals
  FROM     rental    AS r
  JOIN     inventory AS i ON i.inventory_id = r.inventory_id
  GROUP BY i.store_id, r.customer_id
),
ranked AS (
  SELECT   store_id, customer_id, rentals,
           ROW_NUMBER() OVER (PARTITION BY store_id
                              ORDER BY rentals DESC, customer_id) AS rn
  FROM     store_customer
)
SELECT   store_id, customer_id, rentals, rn
FROM     ranked
WHERE    rn <= 2
ORDER BY store_id, rn;`),
W('multi', 'practice', 11, 'Each customer\'s most recent rental: customer_id, rental_id, rental_date, one row per customer. Two rentals at the same instant: keep the higher rental_id.',
  ['Top N per group with N = 1: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY rental_date DESC, rental_id DESC).', 'MAX(rental_date) alone would give the date but could not say which rental_id it belongs to.'],
  `WITH numbered AS (
  SELECT   customer_id, rental_id, rental_date,
           ROW_NUMBER() OVER (PARTITION BY customer_id
                              ORDER BY rental_date DESC, rental_id DESC) AS rn
  FROM     rental
)
SELECT   customer_id, rental_id, rental_date
FROM     numbered
WHERE    rn = 1
ORDER BY customer_id;`, '997 rows; two customers never rented.'),
W('multi', 'practice', 12, 'Put every paying customer into a tier by lifetime payments: Under $100, $100 to $199.99, $200 and up. spend_tier and customers, lowest tier first.',
  ['An aggregate of an aggregate: the tier depends on a SUM per customer, and the count is a GROUP BY on the tier. One GROUP BY cannot do both, so the first grouping is a WITH step.', 'ORDER BY MIN(spend) sorts the tiers by money rather than text.'],
  `WITH spend AS (
  SELECT   customer_id, SUM(amount) AS spend
  FROM     payment
  GROUP BY customer_id
)
SELECT   CASE
           WHEN spend < 100 THEN 'Under $100'
           WHEN spend < 200 THEN '$100 to $199.99'
           ELSE '$200 and up'
         END AS spend_tier,
         COUNT(*) AS customers
FROM     spend
GROUP BY spend_tier
ORDER BY MIN(spend);`, '277 · 198 · 522'),
W('multi', 'practice', 13, 'The seven-day moving average of daily rentals for June 2025: rental_day, rentals, avg_7_days (that day and the six before, 2 decimals). The average for 1 June must cover 26 May through 1 June.',
  ['The window for 1 June needs the six days before it, so the daily CTE starts on 25 May.', 'Compute the average in a second CTE; apply the filter to June in the outer query, after the average exists. Filter first and 1 June\'s "seven-day average" is the average of one day.', 'The frame counts rows; every day in this period has rentals, so seven rows are seven days. Where days can be missing, start from a calendar.'],
  `WITH daily AS (
  SELECT   CAST(rental_date AS date) AS rental_day,
           COUNT(*) AS rentals
  FROM     rental
  WHERE    rental_date >= '2025-05-25'
    AND    rental_date <  '2025-07-01'
  GROUP BY rental_day
),
averaged AS (
  SELECT   rental_day, rentals,
           ROUND(AVG(rentals) OVER (ORDER BY rental_day
                                    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS avg_7_days
  FROM     daily
)
SELECT   rental_day, rentals, avg_7_days
FROM     averaged
WHERE    rental_day >= '2025-06-01'
ORDER BY rental_day;`),
W('multi', 'practice', 14, 'Rentals year on year: year, rentals, prev_rentals, pct_change (1 decimal). Why is the first percentage so large?',
  ['The month-over-month query on yearly rows; nothing changes but the first step.', '100.0 keeps the decimals, because counts are integers.', '2023 looks like a 53% collapse and is not one: 2022 holds a burst of 16,000 rentals in June–August, and 2026 runs only to 28 July. A window compares whatever rows it is given; whether the comparison is fair is the analyst\'s job.'],
  `WITH yearly AS (
  SELECT   EXTRACT(YEAR FROM rental_date) AS year,
           COUNT(*) AS rentals
  FROM     rental
  GROUP BY year
)
SELECT   year, rentals,
         LAG(rentals) OVER (ORDER BY year) AS prev_rentals,
         ROUND(100.0 * (rentals - LAG(rentals) OVER (ORDER BY year))
               / LAG(rentals) OVER (ORDER BY year), 1) AS pct_change
FROM     yearly
ORDER BY year;`),
W('multi', 'practice', 15, 'The most-rented film in each genre: category, title, rentals, one row per genre. Ties: the title that comes first alphabetically wins.',
  ['Top 1 per group over a three-table path: rentals per category per title in a CTE; ROW_NUMBER partitioned by category, ordered by rentals DESC then title.', 'CAT CONEHEADS leads both Action and Horror: a film can be in more than one genre and is counted once in each.'],
  `WITH film_rentals AS (
  SELECT   c.name AS category, f.title, COUNT(*) AS rentals
  FROM     rental        AS r
  JOIN     inventory     AS i  ON i.inventory_id = r.inventory_id
  JOIN     film          AS f  ON f.film_id      = i.film_id
  JOIN     film_category AS fc ON fc.film_id     = f.film_id
  JOIN     category      AS c  ON c.category_id  = fc.category_id
  GROUP BY c.name, f.title
),
ranked AS (
  SELECT   category, title, rentals,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY rentals DESC, title) AS rn
  FROM     film_rentals
)
SELECT   category, title, rentals
FROM     ranked
WHERE    rn = 1
ORDER BY category;`),
W('multi', 'practice', 16, 'The two most expensive films to rent in each genre, ties by title. The colleague put WHERE rn <= 2 in the same query as the ROW_NUMBER and it fails. Explain and fix.',
  ['ERROR: column "rn" does not exist. A query runs FROM, WHERE, GROUP BY, then window functions, then SELECT: when WHERE is evaluated, rn has not been computed yet.', 'Put the numbering in a WITH step, which finishes it, and filter in the query after.', 'Every genre has many films at the top rate of 4.99, so the title tie-breaker decides which two appear.'],
  `WITH ranked AS (
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
W('multi', 'practice', 17, 'The second-longest film in each genre. With ROW_NUMBER and rn = 2, Action returned THEORY MERMAID at 184 minutes, the longest length. Explain and fix.',
  ['ROW_NUMBER gives every row its own number, so when two films share the longest length one of them is numbered 2 and comes back as "second longest" though tied for first.', 'DENSE_RANK gives tied films the same rank with no gap, so rank 2 is the second-longest length, however many films share it. RANK would be wrong the other way: it would skip 2 altogether.'],
  `WITH ranked AS (
  SELECT   c.name AS category, f.title, f.length,
           DENSE_RANK() OVER (PARTITION BY c.name ORDER BY f.length DESC) AS length_rank
  FROM     film          AS f
  JOIN     film_category AS fc ON fc.film_id    = f.film_id
  JOIN     category      AS c  ON c.category_id = fc.category_id
)
SELECT   category, title, length
FROM     ranked
WHERE    length_rank = 2
ORDER BY category, title;`, '23 rows.'),
W('multi', 'practice', 18, 'March, April and May 2025 with the change from the month before. The colleague filtered WHERE rental_date >= \'2025-03-01\' in the monthly count with the LAG in the same query; March\'s previous month came back blank. Explain and fix.',
  ['The WHERE removed February before LAG ran, so March had no previous row. Windows run after WHERE and only see the rows that survive it.', 'Compute every month and the LAG in CTEs, then keep March to May in the outer query.'],
  `WITH monthly AS (
  SELECT   CAST(DATE_TRUNC('month', rental_date) AS date) AS month,
           COUNT(*) AS rentals
  FROM     rental
  WHERE    rental_date >= '2025-01-01'
    AND    rental_date <  '2026-01-01'
  GROUP BY month
),
with_prev AS (
  SELECT   month, rentals,
           LAG(rentals) OVER (ORDER BY month) AS prev_rentals
  FROM     monthly
)
SELECT   month, rentals, prev_rentals,
         rentals - prev_rentals AS change
FROM     with_prev
WHERE    month >= '2025-03-01'
  AND    month <  '2025-06-01'
ORDER BY month;`, 'March 736 (prev 692, +44) · April 760 (+24) · May 802 (+42)'),
W('multi', 'practice', 19, 'Revenue by rating with each rating\'s share of the total, written as SUM(p.amount) / SUM(p.amount) OVER () in the grouped query. It fails with an error about p.amount and the GROUP BY. Explain and fix with a WITH step.',
  ['Window functions run after GROUP BY, so by the time SUM(p.amount) OVER () is evaluated the rows are one per rating and p.amount is gone: "must appear in the GROUP BY clause or be used in an aggregate function".', 'Group in a WITH step, then run the window over its five rows. (SUM(SUM(p.amount)) OVER () in the grouped query also works and is harder to read.)'],
  `WITH by_rating AS (
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
W('multi', 'practice', 20, 'A month-over-month report over the whole history shows May 2022 with a "previous month" of February 2022. Explain, then produce the report from September 2022 onward (keeping August as September\'s previous month). What would make the early months right too?',
  ['LAG reads the previous ROW, not the previous month. Nothing was rented in March or April 2022, so those months have no row, and May\'s previous row is February.', 'Compute the LAG over every month in a CTE, then keep the months from September 2022 in the outer query, so September still sees August.', 'To fix the early months, the report needs one row per month whether or not anything was rented: a calendar table joined with LEFT JOIN so the empty months appear as zeros.'],
  `WITH monthly AS (
  SELECT   CAST(DATE_TRUNC('month', rental_date) AS date) AS month,
           COUNT(*) AS rentals
  FROM     rental
  GROUP BY month
),
with_prev AS (
  SELECT   month, rentals,
           LAG(month)   OVER (ORDER BY month) AS prev_month,
           LAG(rentals) OVER (ORDER BY month) AS prev_rentals
  FROM     monthly
)
SELECT   month, rentals, prev_month, prev_rentals,
         rentals - prev_rentals AS change
FROM     with_prev
WHERE    month >= '2022-09-01'
ORDER BY month;`),

/* ================= MULTI-STEP: lecture ================= */
W('multi', 'lecture', 1, 'Each region\'s share of all units sold, as a percentage with one decimal. One row per region, largest share first.',
  ['Step 1 returns one row per region with its units: a CTE over orders → order_items.', 'Step 2: SUM(units) OVER () beside each row; 100.0 keeps the decimals since units is an integer.'],
  `WITH by_region AS (
  SELECT   o.region, SUM(oi.units) AS units
  FROM     lecture.orders      AS o
  JOIN     lecture.order_items AS oi ON oi.order_id = o.order_id
  GROUP BY o.region
)
SELECT   region, units,
         ROUND(100.0 * units / SUM(units) OVER (), 1) AS pct
FROM     by_region
ORDER BY units DESC;`, 'Southeast 838 37.0 · Northeast 551 24.4 · West 446 19.7 · Midwest 427 18.9'),
W('multi', 'lecture', 2, 'The top-spending customer in each region: region, first and last name, and their spend in that region. One row per region.',
  ['Step 1: spend per region per customer (a customer can buy in several regions, so group by both).', 'Step 2: ROW_NUMBER() OVER (PARTITION BY region ORDER BY spend DESC).', 'Step 3: keep rn = 1 outside the CTE.'],
  `WITH spend AS (
  SELECT o.region, c.first_name, c.last_name,
         SUM(oi.units * p.unit_price) AS spend
  FROM lecture.orders o
  JOIN lecture.customers c    ON c.customer_id = o.customer_id
  JOIN lecture.order_items oi ON oi.order_id = o.order_id
  JOIN lecture.products p     ON p.product_id = oi.product_id
  GROUP BY o.region, c.customer_id, c.first_name, c.last_name
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY region ORDER BY spend DESC) AS rn
  FROM   spend
)
SELECT region, first_name, last_name, spend
FROM   ranked WHERE rn = 1 ORDER BY region;`, 'Sowande 310.50 (MW) · Marchetti 371.50 (NE) · Bianchi 758.20 (SE) · Nguyen 380.65 (W)'),

/* ================= MULTI-STEP: lab ================= */
W('multi', 'lab', 1, 'Which physical stores took more orders in 2025 than the average store did? Leave the online store out of both the count and the average. store_id, country_name, orders; most first, then store_id. 28 rows.',
  ['Step 1: orders per store in 2025, excluding 999999, in a CTE.', 'Step 2: the average of those counts is a scalar subquery over the CTE.', 'Step 3: keep the stores above it and join stores for the country name.'],
  `WITH store_orders AS (
  SELECT   store_id, COUNT(*) AS orders
  FROM     orders
  WHERE    store_id <> 999999
    AND    order_date >= '2025-01-01'
    AND    order_date <  '2026-01-01'
  GROUP BY store_id
)
SELECT   so.store_id, s.country_name, so.orders
FROM     store_orders AS so
JOIN     stores       AS s ON s.store_id = so.store_id
WHERE    so.orders > (SELECT AVG(orders) FROM store_orders)
ORDER BY so.orders DESC, so.store_id;`),
W('multi', 'lab', 2, 'For 2025: category_name, revenue (2 decimals), and its share of all 2025 revenue (1 decimal). Highest revenue first. 8 rows.',
  ['Group first (revenue per category in a CTE), window second (SUM(revenue) OVER ()).'],
  `WITH by_category AS (
  SELECT   p.category_name, SUM(ol.quantity * ol.net_price) AS revenue
  FROM     order_lines AS ol
  JOIN     orders      AS o ON o.order_id   = ol.order_id
  JOIN     products    AS p ON p.product_id = ol.product_id
  WHERE    o.order_date >= '2025-01-01'
    AND    o.order_date <  '2026-01-01'
  GROUP BY p.category_name
)
SELECT   category_name,
         ROUND(revenue, 2) AS revenue,
         ROUND(100 * revenue / SUM(revenue) OVER (), 1) AS pct_of_total
FROM     by_category
ORDER BY revenue DESC;`),
W('multi', 'lab', 3, 'Rank the products in the Recording Pen subcategory by unit_price, highest first; several share a price. product_name, unit_price, RANK, DENSE_RANK. Sort by unit_price highest first, then product_name. 20 rows.',
  ['No CTE needed: both window functions go straight on the filtered rows.', 'Ties share a place in both; RANK skips the next place, DENSE_RANK does not.'],
  `SELECT   product_name, unit_price,
         RANK()       OVER (ORDER BY unit_price DESC) AS price_rank,
         DENSE_RANK() OVER (ORDER BY unit_price DESC) AS dense_price_rank
FROM     products
WHERE    subcategory_name = 'Recording Pen'
ORDER BY unit_price DESC, product_name;`),
W('multi', 'lab', 4, 'For each month of 2025: month (as a date), orders, orders in the month before, and the change. January\'s last two columns are NULL. 12 rows.',
  ['Monthly CTE, then LAG(orders) OVER (ORDER BY month) in a second CTE so the change can use the name.'],
  `WITH monthly AS (
  SELECT   CAST(DATE_TRUNC('month', order_date) AS date) AS month,
           COUNT(*) AS orders
  FROM     orders
  WHERE    order_date >= '2025-01-01'
    AND    order_date <  '2026-01-01'
  GROUP BY month
),
with_prev AS (
  SELECT   month, orders,
           LAG(orders) OVER (ORDER BY month) AS prev_orders
  FROM     monthly
)
SELECT   month, orders, prev_orders,
         orders - prev_orders AS change
FROM     with_prev
ORDER BY month;`),
W('multi', 'lab', 5, 'For 2025: the store\'s country_name, category_name, revenue (2 decimals), and the category\'s share of that country\'s 2025 revenue (1 decimal). Sort by country_name, then revenue highest first. 72 rows.',
  ['CTE: one row per country per category.', 'PARTITION BY country_name makes the window total a country\'s total, so each country\'s categories add to 100.'],
  `WITH cc AS (
  SELECT   s.country_name, p.category_name,
           SUM(ol.quantity * ol.net_price) AS revenue
  FROM     order_lines AS ol
  JOIN     orders      AS o ON o.order_id   = ol.order_id
  JOIN     stores      AS s ON s.store_id   = o.store_id
  JOIN     products    AS p ON p.product_id = ol.product_id
  WHERE    o.order_date >= '2025-01-01'
    AND    o.order_date <  '2026-01-01'
  GROUP BY s.country_name, p.category_name
)
SELECT   country_name, category_name,
         ROUND(revenue, 2) AS revenue,
         ROUND(100 * revenue / SUM(revenue) OVER (PARTITION BY country_name), 1) AS pct_of_country
FROM     cc
ORDER BY country_name, revenue DESC;`),
W('multi', 'lab', 6, 'For 2025, the three products with the most revenue in each category: category_name, product_name, revenue (2 decimals), rank within category (1, 2, 3). Sort by category_name, then rank. 24 rows.',
  ['Top N per group: revenue per category per product in a CTE; ROW_NUMBER partitioned by category in a second; rn <= 3 outside.', 'No ties in any top three, so ROW_NUMBER is safe; add product_name as a tie-breaker anyway.'],
  `WITH product_revenue AS (
  SELECT   p.category_name, p.product_name,
           SUM(ol.quantity * ol.net_price) AS revenue
  FROM     order_lines AS ol
  JOIN     orders      AS o ON o.order_id   = ol.order_id
  JOIN     products    AS p ON p.product_id = ol.product_id
  WHERE    o.order_date >= '2025-01-01'
    AND    o.order_date <  '2026-01-01'
  GROUP BY p.category_name, p.product_name
),
ranked AS (
  SELECT   category_name, product_name, revenue,
           ROW_NUMBER() OVER (PARTITION BY category_name
                              ORDER BY revenue DESC, product_name) AS rn
  FROM     product_revenue
)
SELECT   category_name, product_name, ROUND(revenue, 2) AS revenue, rn
FROM     ranked
WHERE    rn <= 3
ORDER BY category_name, rn;`),
W('multi', 'lab', 7, 'For each month of 2025: month (as a date), revenue (2 decimals), and the running total from January through that month (2 decimals). 12 rows.',
  ['Monthly revenue CTE over order_lines → orders; the running total frame from UNBOUNDED PRECEDING to CURRENT ROW.'],
  `WITH monthly AS (
  SELECT   CAST(DATE_TRUNC('month', o.order_date) AS date) AS month,
           SUM(ol.quantity * ol.net_price) AS revenue
  FROM     order_lines AS ol
  JOIN     orders      AS o ON o.order_id = ol.order_id
  WHERE    o.order_date >= '2025-01-01'
    AND    o.order_date <  '2026-01-01'
  GROUP BY month
)
SELECT   month,
         ROUND(revenue, 2) AS revenue,
         ROUND(SUM(revenue) OVER (ORDER BY month
                                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS running_total
FROM     monthly
ORDER BY month;`),
W('multi', 'lab', 8, 'In each category, which products are priced at the second-highest price? If four products tie at the top price, the second-highest price is the next distinct price down, and every product at that price is returned. category_name, product_name, unit_price. Sort by category_name, then product_name. 40 rows.',
  ['"Second-highest price, all products at it" is DENSE_RANK = 2: ties share a rank and no rank is skipped.', 'ROW_NUMBER would return one arbitrary product; RANK would skip 2 after a tie at the top.'],
  `WITH ranked AS (
  SELECT   category_name, product_name, unit_price,
           DENSE_RANK() OVER (PARTITION BY category_name ORDER BY unit_price DESC) AS price_rank
  FROM     products
)
SELECT   category_name, product_name, unit_price
FROM     ranked
WHERE    price_rank = 2
ORDER BY category_name, product_name;`),
W('multi', 'lab', 9, 'Year-over-year change for 2023, 2024 and 2025 only: year, revenue, previous year\'s revenue (2 decimals each), percentage change (1 decimal). 2022\'s revenue must appear on the 2023 row. 3 rows.',
  ['Trap: filter to 2023–2025 before the LAG and 2023 loses its previous year. Build every year in the CTE, LAG in a second CTE, filter outside.', '100.0 for decimals; NULLIF guards a zero previous year.'],
  `WITH yearly AS (
  SELECT   EXTRACT(YEAR FROM o.order_date) AS year,
           SUM(ol.quantity * ol.net_price) AS revenue
  FROM     order_lines AS ol
  JOIN     orders      AS o ON o.order_id = ol.order_id
  GROUP BY year
),
with_prev AS (
  SELECT   year, revenue,
           LAG(revenue) OVER (ORDER BY year) AS prev_revenue
  FROM     yearly
)
SELECT   year,
         ROUND(revenue, 2)      AS revenue,
         ROUND(prev_revenue, 2) AS prev_revenue,
         ROUND(100.0 * (revenue - prev_revenue) / NULLIF(prev_revenue, 0), 1) AS pct_change
FROM     with_prev
WHERE    year BETWEEN 2023 AND 2025
ORDER BY year;`),
W('multi', 'lab', 10, 'For each day from 1 to 14 March 2024: calendar_date, orders that day, and the average orders per day over the seven days ending that day (2 decimals). Every day counts, including days with no orders; 1 March covers 24 February through 1 March. 14 rows.',
  ['Start from calendar with a LEFT JOIN so a day with no orders is a row worth 0; a frame counts rows, and seven rows are seven days only if every day has a row.', 'The daily CTE must begin on 24 February; the moving average in a second CTE; the filter to March in the outer query.'],
  `WITH daily AS (
  SELECT   cal.calendar_date, COUNT(o.order_id) AS orders
  FROM     calendar AS cal
  LEFT JOIN orders  AS o ON o.order_date = cal.calendar_date
  WHERE    cal.calendar_date >= '2024-02-24'
    AND    cal.calendar_date <  '2024-03-15'
  GROUP BY cal.calendar_date
),
averaged AS (
  SELECT   calendar_date, orders,
           ROUND(AVG(orders) OVER (ORDER BY calendar_date
                                   ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS avg_7_days
  FROM     daily
)
SELECT   calendar_date, orders, avg_7_days
FROM     averaged
WHERE    calendar_date >= '2024-03-01'
ORDER BY calendar_date;`),
];
