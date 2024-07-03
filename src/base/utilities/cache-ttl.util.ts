export class CacheTTL {
  public static TEN_SECONDS = 10 * 1000;
  public static ONE_MINUTE = 60 * 1000;
  public static THREE_MINUTES = 180 * 1000;
  public static FIFTEEN_MINUTES = 900 * 1000;

  public static ONE_HOUR = 3600 * 1000;
  public static TWO_HOURS = 7200 * 1000;
  public static THREE_HOURS = 10800 * 1000;
  public static FOUR_HOURS = 14400 * 1000;
  public static FIVE_HOURS = 18000 * 1000;
  public static SIX_HOURS = 21_600 * 1000;
  public static TWELVE_HOURS = 43_200 * 1000;

  public static ONE_DAY = 86_400 * 1000;
  public static THREE_DAYS = 258_200 * 1000;

  public static ONE_WEEK = 604_800 * 1000;

  public static tillTomorrowMidnight(): number {
    const tomorrowMidnight = new Date();
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
    tomorrowMidnight.setHours(0, 0, 0, 0);

    return tomorrowMidnight.getTime() - new Date().getTime();
  }
}
