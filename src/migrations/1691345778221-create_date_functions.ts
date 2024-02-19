import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDateFunctions1691345778221 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION adddays(d date, days integer)
        RETURNS date
        LANGUAGE plpgsql
        AS \$function$
        BEGIN
            RETURN d + days;
        END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION adddays(d date, days integer)
RETURNS date
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN d + days;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jday(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jday(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION datediff(d1 timestamp without time zone, d2 timestamp without time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN d1-d2;
END;

        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gdate(d date, w integer)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
IF w = 0 THEN RETURN extract(year from d); END IF;
IF w = 1 THEN RETURN extract(month from d); END IF;
IF w = 2 THEN RETURN extract(day from d); END IF;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gday(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gdate(d, 2);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gday(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gday(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gdayofweek(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
DECLARE
c INTEGER;
BEGIN
c = extract(dow from d);

IF c = 0 THEN RETURN 'Sunday'; END IF;
IF c = 1 THEN RETURN 'Monday'; END IF;
IF c = 2 THEN RETURN 'Tuesday'; END IF;
IF c = 3 THEN RETURN 'Wednesday'; END IF;
IF c = 4 THEN RETURN 'Thursday'; END IF;
IF c = 5 THEN RETURN 'Friday'; END IF;
IF c = 6 THEN RETURN 'Saturday'; END IF;
RETURN NULL;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gdayofweek(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gdayofweek(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gdayofweeknumber(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
DECLARE
c INTEGER;
BEGIN
c = extract(dow from d);
IF c = 6 THEN
RETURN 1;
ELSE
RETURN c + 2;
END IF;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gdayofweeknumber(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gdayofweeknumber(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gdayofyear(dt date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
DECLARE
c INTEGER;
d INTEGER;
m INTEGER;
Y INTEGER;
dd VARCHAR(2);
mm VARCHAR(2);
BEGIN
Y = netform.gDate(dt, 0);
m = netform.gDate(dt, 1);
d = netform.gDate(dt, 2);

IF d < 10 THEN
dd = CONCAT('0', d);
ELSE
dd = CONCAT('', d);
END IF;

IF m < 10 THEN
mm = CONCAT('0', m);
ELSE
mm = CONCAT('', m);
END IF;

RETURN CONCAT(Y, '/', mm, '/', dd);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gdayofyear(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gdayofyear(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jday_of_month(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
DECLARE
dom INTEGER;
BEGIN
dom = jdate(d,2);
RETURN dom;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jdayofyear(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jdayofyear(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jmonth(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jdate(d, 1);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jmonth(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jmonth(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jdayofweek(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
DECLARE
c INTEGER;
BEGIN
c = extract(dow from d);

IF c = 0 THEN RETURN 'یکشنبه'; END IF;
IF c = 1 THEN RETURN 'دوشنبه'; END IF;
IF c = 2 THEN RETURN 'سه شنبه'; END IF;
IF c = 3 THEN RETURN 'چهارشنبه'; END IF;
IF c = 4 THEN RETURN 'پنج شنبه'; END IF;
IF c = 5 THEN RETURN 'جمعه'; END IF;
IF c = 6 THEN RETURN 'شنبه'; END IF;
RETURN NULL;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jdayofweek(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jdayofweek(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jdayofweeknumber(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
DECLARE
c INTEGER;
BEGIN
c = extract(dow from d);
IF c = 6 THEN
RETURN 1;
ELSE
RETURN c + 2;
END IF;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jdayofweeknumber(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jdayofweeknumber(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jdayofyear(dt date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
DECLARE
c INTEGER;
d INTEGER;
m INTEGER;
Y INTEGER;
dd VARCHAR(2);
mm VARCHAR(2);
BEGIN
Y = jDate(dt, 0);
m = jDate(dt, 1);
d = jDate(dt, 2);

IF d < 10 THEN
dd = CONCAT('0', d);
ELSE
dd = CONCAT('', d);
END IF;

IF m < 10 THEN
mm = CONCAT('0', m);
ELSE
mm = CONCAT('', m);
END IF;

RETURN CONCAT(Y, '/', mm, '/', dd);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gmonth(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gdate(d, 1);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gmonth(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gmonth(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gmonthname(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
DECLARE
c INTEGER;
BEGIN
c = gDate(d, 1);

IF c = 1 THEN RETURN 'January'; END IF;
IF c = 2 THEN RETURN 'February'; END IF;
IF c = 3 THEN RETURN 'March'; END IF;
IF c = 4 THEN RETURN 'April'; END IF;
IF c = 5 THEN RETURN 'May'; END IF;
IF c = 6 THEN RETURN 'June'; END IF;
IF c = 7 THEN RETURN 'July'; END IF;
IF c = 8 THEN RETURN 'August'; END IF;
IF c = 9 THEN RETURN 'September'; END IF;
IF c = 10 THEN RETURN 'October'; END IF;
IF c = 11 THEN RETURN 'November'; END IF;
IF c = 12 THEN RETURN 'December'; END IF;
RETURN 0;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gmonthname(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gmonthname(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gseason(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gSeason(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gseason(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jSeason(d);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gyear(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gdate(d, 0);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gyear(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gyear(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gyearmonth(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN gYearMonth(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION gyearmonth(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN concat(gYear(d), '/', gMonth(d));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jdate(d timestamp with time zone, w integer)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jdate(CAST(d AS date), w);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jdate(d date, w integer)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
DECLARE
g_y INTEGER;
g_m INTEGER;
g_d INTEGER;
i INTEGER;
g_day_no INTEGER;
j_day_no INTEGER;
j_np INTEGER;
jy INTEGER;
jm VARCHAR;
jd VARCHAR;
gy INTEGER;
gm INTEGER;
gd INTEGER;
BEGIN

IF d IS NULL THEN RETURN NULL; END IF;

g_y = extract(year from d);
g_m = extract(month from d);
g_d = extract(day from d);

gy = g_y - 1600;
gm = g_m - 1;
gd = g_d - 1;

g_day_no = 365 * gy + ((gy + 3) / 4) - ((gy + 99) / 100) + ((gy + 399) / 400);

i = 0;
LOOP
IF i >= gm THEN
    EXIT;
END IF;
g_day_no = g_day_no + monthDays(i);
i = i + 1;
IF i >= gm THEN
    EXIT;
END IF;
END LOOP;

IF gm > 1 AND ((gy % 4 = 0 AND gy % 100 <> 0) OR (gy % 400 = 0)) THEN
g_day_no = g_day_no + 1;
END IF;

g_day_no = g_day_no + gd;
j_day_no = g_day_no - 79;
j_np = j_day_no / 12053;
j_day_no = j_day_no % 12053;
jy = 979 + 33 * j_np + 4 * (j_day_no / 1461);
j_day_no = j_day_no % 1461;

IF j_day_no >= 366 THEN
jy = jy + ((j_day_no - 1) / 365);
j_day_no = (j_day_no - 1) % 365;
END IF;

i = 0;
LOOP
IF NOT(i < 11 AND j_day_no >= jMonthDays(i)) THEN
    EXIT;
END IF;

j_day_no = j_day_no - jMonthDays(i);

i = i + 1;
END LOOP;

jm = i + 1;
IF jm::INTEGER < 10 THEN jm = CONCAT('0', jm); END IF;

jd = j_day_no + 1;
IF jd::INTEGER < 10 THEN jd = CONCAT('0', jd); END IF;

IF w = 0 THEN RETURN jy; END IF;
IF w = 1 THEN RETURN jm; END IF;
IF w = 2 THEN RETURN jd; END IF;
IF w = 3 THEN RETURN CONCAT(jy, jm)::integer; END IF;
IF w = 4 THEN RETURN CONCAT(jy, jm, jd)::integer; END IF;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jday(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jdate(d, 2);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jmonthdays(n integer)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
IF n >= 0 AND n <= 5 THEN
RETURN 31;
END IF;
IF n >= 6 AND n <= 10 THEN
RETURN 30;
END IF;
IF n = 11 THEN
RETURN 29;
END IF;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jmonthname(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jmonthname(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jmonthname(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
DECLARE
c INTEGER;
BEGIN
c = jDate(d, 1);

IF c = 1 THEN RETURN 'فروردين'; END IF;
IF c = 2 THEN RETURN 'ارديبهشت'; END IF;
IF c = 3 THEN RETURN 'خرداد'; END IF;
IF c = 4 THEN RETURN 'تير'; END IF;
IF c = 5 THEN RETURN 'مرداد'; END IF;
IF c = 6 THEN RETURN 'شهريور'; END IF;
IF c = 7 THEN RETURN 'مهر'; END IF;
IF c = 8 THEN RETURN 'آبان'; END IF;
IF c = 9 THEN RETURN 'آذر'; END IF;
IF c = 10 THEN RETURN 'دي'; END IF;
IF c = 11 THEN RETURN 'بهمن'; END IF;
IF c = 12 THEN RETURN 'اسفند'; END IF;
RETURN 0;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jseason(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jSeason(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jseason(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
DECLARE
m INTEGER;
BEGIN
m = jMonth(d);
IF m >= 1 AND m <= 3 THEN RETURN 'بهار'; END IF;
IF m >= 4 AND m <= 6 THEN RETURN 'تابستان'; END IF;
IF m >= 7 AND m <= 9 THEN RETURN 'پاییز'; END IF;
IF m >= 10 AND m <= 12 THEN RETURN 'زمستان'; END IF;
RETURN NULL;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jseasonnumber(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
DECLARE
m INTEGER;
BEGIN
RETURN jseasonnumber(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jseasonnumber(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
DECLARE
m INTEGER;
BEGIN
m = jMonth(d);
IF m >= 1 AND m <= 3 THEN RETURN 1; END IF;
IF m >= 4 AND m <= 6 THEN RETURN 2; END IF;
IF m >= 7 AND m <= 9 THEN RETURN 3; END IF;
IF m >= 10 AND m <= 12 THEN RETURN 4; END IF;
RETURN NULL;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jyear(d date)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
IF extract(month from d) > 3
OR (extract(month from d) = 3
    AND (extract(day from d) >= 21 OR (extract(year from d)::int % 4 = 0 AND extract(day from d) >= 20))) THEN

RETURN extract(year from d)-621;
ELSE
RETURN extract(year from d)-622;
END IF;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jyear(d timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jyear(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jyearmonth(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN concat(jYear(d), '/', jDate(d, 1));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION jyearmonth(d timestamp with time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN jYearMonth(CAST(d AS date));
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION monthdays(n integer)
RETURNS integer
LANGUAGE plpgsql
AS \$function$
BEGIN
IF n = 1 THEN
RETURN 28;
END IF;
IF n = 3 OR n = 5 OR n = 8 OR n = 10 THEN
RETURN 30;
END IF;
IF n = 0 OR n = 2 OR n = 4 OR n = 6 OR n = 7 OR n = 9 OR n = 11 THEN
RETURN 31;
END IF;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION pdate(d date)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$
DECLARE
jy INTEGER;
jm INTEGER;
jd INTEGER;
dd VARCHAR(2);
mm VARCHAR(2);
BEGIN

jy = jDate(d, 0);
jm = jDate(d, 1);
jd = jDate(d, 2);

IF jd < 10 THEN
dd = CONCAT('0', jd);
ELSE
dd = CONCAT('', jd);
END IF;

IF jm < 10 THEN
mm = CONCAT('0', jm);
ELSE
mm = CONCAT('', jm);
END IF;

RETURN CONCAT(jy, '-', mm, '-', dd);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION pdate(d timestamp without time zone)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$

DECLARE
jy INTEGER;
jm INTEGER;
jd INTEGER;
dd VARCHAR(2);
mm VARCHAR(2);
BEGIN

jy = jDate(date(d), 0);
jm = jDate(date(d), 1);
jd = jDate(date(d), 2);

IF jd < 10 THEN
dd = CONCAT('0', jd);
ELSE
dd = CONCAT('', jd);
END IF;

IF jm < 10 THEN
mm = CONCAT('0', jm);
ELSE
mm = CONCAT('', jm);
END IF;

RETURN CONCAT(jy, '-', mm, '-', dd, ' ', d::time);
END;

        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION pdate(d timestamp without time zone, z character varying)
RETURNS character varying
LANGUAGE plpgsql
AS \$function$

DECLARE
jy INTEGER;
jm INTEGER;
jd INTEGER;
dd VARCHAR(2);
mm VARCHAR(2);
BEGIN

d = timezone(z, d);

jy = jDate(date(d), 0);
jm = jDate(date(d), 1);
jd = jDate(date(d), 2);

IF jd < 10 THEN
dd = CONCAT('0', jd);
ELSE
dd = CONCAT('', jd);
END IF;

IF jm < 10 THEN
mm = CONCAT('0', jm);
ELSE
mm = CONCAT('', jm);
END IF;

RETURN CONCAT(jy, '-', mm, '-', dd, ' ', d::time);
END;

        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION todate(d character varying)
RETURNS date
LANGUAGE plpgsql
AS \$function$
BEGIN
IF d = '0000-00-00' THEN RETURN NULL; END IF;
RETURN CAST(d AS date);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION todatetime(d character varying)
RETURNS timestamp without time zone
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN CAST(d AS timestamp without time zone);
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION todecrypt(v bytea, k bytea)
RETURNS text
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN encode(decrypt(v, k, 'aes'),'escape');
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION toencrypt(v bytea, k bytea)
RETURNS bytea
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN encrypt(v, k, 'aes');
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION totime(t time without time zone)
RETURNS time without time zone
LANGUAGE plpgsql
AS \$function$
BEGIN
RETURN t;
END;
        \$function$;
`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION j2g(datestr character varying)
RETURNS date
LANGUAGE plpgsql
AS \$function$
DECLARE
YYear int;
MMonth int;
DDay int;
epbase int;
epyear int;
mdays int;
persian_jdn int;
i int;
j int;
l int;
n int;
TMPRESULT varchar(10);
IsValideDate int;
LEN int;
TempStr varchar(20);
TmpDateStr varchar(10);
BEGIN
LEN = (select length(datestr));
if LEN < 8 then return null; end if;

i=5;
TmpDateStr = DateStr;
YYear=CAST(SUBSTRING(TmpDateStr,1,i-1) AS INT);

IF YYear < 1300 then
YYear =YYear + 1300;
end if;

IF YYear > 9999 then
RETURN NULL;
end if;

if position('/' in DateStr) > 0 then
MMonth=CAST(SUBSTRING(TmpDateStr from '/([0-9]+)/') AS INT);
DDay=CAST(SUBSTRING(TmpDateStr from '/([0-9]+)$') AS INT);
else
TempStr= SUBSTRING(TmpDateStr,i,length(TmpDateStr));
i=3;
MMonth=CAST(SUBSTRING(TempStr,1,2) AS INT);

TempStr= SUBSTRING(TempStr,3,2);
DDay=CAST(TempStr AS INT);
end if;

IF ( YYear >= 0 ) then
epbase = YYear - 474;
Else
epbase = YYear - 473;
end if;
epyear = 474 + (epbase % 2820);

IF (MMonth <= 7 ) then
mdays = ((MMonth) - 1) * 31;
Else
mdays = ((MMonth) - 1) * 30 + 6;
end if;

persian_jdn =(DDay)  + mdays + CAST((((epyear * 682) - 110) / 2816) as int)  + (epyear - 1) * 365  +  CAST((epbase / 2820)  as int ) * 1029983  + (1948321 - 1);
IF (persian_jdn > 2299160) then
l = persian_jdn + 68569;
 n = CAST(((4 * l) / 146097) as int);
 l = l -  CAST(((146097 * n + 3) / 4) as int);
 i =  CAST(((4000 * (l + 1)) / 1461001) as int);
 l = l - CAST( ((1461 * i) / 4) as int) + 31;
 j =  CAST(((80 * l) / 2447) as int);
 DDay = l - CAST( ((2447 * j) / 80) as int);
 l =  CAST((j / 11) as int);
 MMonth = j + 2 - 12 * l;
 YYear = 100 * (n - 49) + i + l;
END if;

TMPRESULT=Cast(MMonth as varchar(2)) || '/' || CAST(DDay as Varchar(2)) || '/' || CAST(YYear as varchar(4));
RETURN Cast(TMPRESULT as date);
RETURN NULL;
END;
        \$function$;
`);
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS adddays(d date, days integer)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jday(d timestamp with time zone)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS checkbound(location character varying, lat1 numeric, lng1 numeric, lat2 numeric, lng2 numeric)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS datediff(d1 timestamp without time zone, d2 timestamp without time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS gdate(d date, w integer)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS gday(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gday(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS gdayofweek(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gdayofweek(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS gdayofweeknumber(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gdayofweeknumber(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS gdayofyear(dt date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gdayofyear(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jday_of_month(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jdayofyear(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jmonth(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jmonth(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jdayofweek(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jdayofweek(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jdayofweeknumber(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jdayofweeknumber(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jdayofyear(dt date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS generate_create_table_statement(p_table_name character varying)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS gmonth(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gmonth(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS gmonthname(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gmonthname(d timestamp with time zone)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gseason(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS gseason(d date)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS gyear(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gyear(d timestamp with time zone)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS gyearmonth(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS gyearmonth(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS hassubstring(v character varying, f character varying)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jdate(d timestamp with time zone, w integer)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jdate(d date, w integer)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS jday(d date)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS jmonthdays(n integer)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jmonthname(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jmonthname(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jseason(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jseason(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jseasonnumber(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jseasonnumber(d date)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS jyear(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jyear(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS jyearmonth(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS jyearmonth(d timestamp with time zone)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS monthdays(n integer)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS pdate(d date)`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS pdate(d timestamp without time zone)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS pdate(d timestamp without time zone, z character varying)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS todate(d character varying)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS todatetime(d character varying)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS todecrypt(v bytea, k bytea)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS toencrypt(v bytea, k bytea)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS tonumber(s character varying)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS totime(t time without time zone)`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS j2g(datestr character varying)`,
    );
  }
}
