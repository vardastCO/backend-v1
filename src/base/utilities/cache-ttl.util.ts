export class CacheTTL {
  public static THREE_MINUTES = 180;
  public static FIFTEEN_MINUTES = 900;

  public static ONE_HOUR = 3600;
  public static TWO_HOURS = 7200;
  public static THREE_HOURS = 10800;
  public static FOUR_HOURS = 14400;
  public static FIVE_HOURS = 18000;
  public static SIX_HOURS = 21_600;
  public static TWELVE_HOURS = 43_200;

  public static ONE_DAY = 86_400;
  public static THREE_DAYS = 258_200;

  public static ONE_WEEK = 604_800;
  public static ONE_MONTH = 2_592_000;

  public static tillTomorrowMidnight(): number {
    const tomorrowMidnight = new Date();
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
    tomorrowMidnight.setHours(0, 0, 0, 0);

    return tomorrowMidnight.getTime() - new Date().getTime();
  }
}
