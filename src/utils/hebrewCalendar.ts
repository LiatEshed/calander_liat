/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HDate, Sedra, HebrewCalendar } from '@hebcal/core';
import { HebrewDateInfo } from '../types';

// Convert number to Hebrew numeral (e.g., 15 -> טו, 1 -> א׳, 16 -> טז, 24 -> כד)
export function getHebrewNumeral(n: number): string {
  const letters: [number, string][] = [
    [400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'],
    [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'],
    [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']
  ];
  if (n === 15) return 'טו';
  if (n === 16) return 'טז';
  let result = '';
  let temp = n;
  for (const [val, char] of letters) {
    while (temp >= val) {
      result += char;
      temp -= val;
    }
  }
  // Add traditional formatting mark (geresh or gershayim)
  if (result.length === 1) {
    return result + "׳";
  } else if (result.length > 1) {
    return result.slice(0, -1) + "״" + result.slice(-1);
  }
  return result;
}

// Translate English Hebrew year (e.g. 5786) to Hebrew letters (e.g. ה׳תשפ״ו)
export function getHebrewYearNumeral(year: number): string {
  // Years are usually written without the thousands digit (5000 is represented by ה׳)
  const thousands = Math.floor(year / 1000);
  const remainder = year % 1000;
  
  const thousandsStr = thousands > 0 ? getHebrewNumeral(thousands) + " " : "";
  const remainderStr = getHebrewNumeral(remainder);
  
  // Format as ה׳תשפ״ו (if thousands is 5)
  if (thousands === 5) {
    return `ה׳${remainderStr}`;
  }
  return `${thousandsStr}${remainderStr}`;
}

const monthTranslations: { [key: string]: string } = {
  "Nisan": "ניסן",
  "Iyyar": "אייר",
  "Sivan": "סיון",
  "Tamuz": "תמוז",
  "Av": "אב",
  "Elul": "אלול",
  "Tishrei": "תשרי",
  "Cheshvan": "חשוון",
  "Kislev": "כסלו",
  "Tevet": "טבת",
  "Sh'vat": "שבט",
  "Adar": "אדר",
  "Adar I": "אדר א׳",
  "Adar II": "אדר ב׳"
};

const parashaTranslations: { [key: string]: string } = {
  "Bereshit": "בראשית",
  "Noach": "נח",
  "Lech-Lecha": "לך-לך",
  "LechLecha": "לך-לך",
  "Vayera": "וירא",
  "Chayei Sara": "חיי שרה",
  "ChayeiSara": "חיי שרה",
  "Toledot": "תולדות",
  "Vayetzei": "ויצא",
  "Vayishlach": "וישלח",
  "Vayeshev": "וישב",
  "Miketz": "מקץ",
  "Vayigash": "ויגש",
  "Vayechi": "ויחי",
  "Shemot": "שמות",
  "Vaera": "וארא",
  "Bo": "בוא",
  "Beshalach": "בשלח",
  "Yitro": "יתרו",
  "Mishpatim": "משפטים",
  "Terumah": "תרומה",
  "Tetzaveh": "תצווה",
  "Ki Tisa": "כי תשא",
  "KiTisa": "כי תשא",
  "Vayakhel": "ויקהל",
  "Pekudei": "פקודי",
  "Vayikra": "ויקרא",
  "Tzav": "צו",
  "Shmini": "שמיני",
  "Tazria": "תזריע",
  "Metzora": "מצורע",
  "Achrei Mot": "אחרי מות",
  "AchreiMot": "אחרי מות",
  "Kedoshim": "קדושים",
  "Emor": "אמור",
  "Behar": "בהר",
  "Bechukotai": "בחוקותיי",
  "Bamidbar": "במדבר",
  "Nasso": "נשא",
  "Beha'alotcha": "בהעלותך",
  "Beha'alotekha": "בהעלותך",
  "Sh'lach": "שלח",
  "Shelach": "שלח",
  "Shelach-Lecha": "שלח לך",
  "Korach": "קורח",
  "Chukat": "חוקת",
  "Balak": "בלק",
  "Pinchas": "פינחס",
  "Matot": "מטות",
  "Massei": "מסעי",
  "Devarim": "דברים",
  "Vaetchanan": "ואתחנן",
  "Eikev": "עקב",
  "Re'eh": "ראה",
  "Shoftim": "שופטים",
  "Ki Teitzei": "כי תצא",
  "KiTeitzei": "כי תצא",
  "Ki Tavo": "כי תבוא",
  "KiTavo": "כי תבוא",
  "Nitzavim": "ניצבים",
  "Vayeilech": "וילך",
  "Ha'azinu": "האזינו",
  "V'Zot HaBerachah": "וזאת הברכה",
  "V'ZotHaBerachah": "וזאת הברכה"
};

const holidayTranslations: { [key: string]: string } = {
  "Rosh Chodesh": "ראש חודש",
  "Pesach": "פסח",
  "Pesach I": "פסח יום א׳",
  "Pesach VII": "פסח שביעי של פסח",
  "Shavuot": "שבועות",
  "Shavuot I": "שבועות יום א׳",
  "Rosh Hashana": "ראש השנה",
  "Rosh Hashana I": "ראש השנה יום א׳",
  "Rosh Hashana II": "ראש השנה יום ב׳",
  "Yom Kippur": "יום כיפור",
  "Sukkot": "סוכות",
  "Sukkot I": "סוכות יום א׳",
  "Shmini Atzeret": "שמיני עצרת",
  "Simchat Torah": "שמחת תורה",
  "Chanukah": "חנוכה",
  "Chanukah: 1 Candle": "חנוכה - נר ראשון",
  "Chanukah: 2 Candles": "חנוכה - נר שני",
  "Chanukah: 3 Candles": "חנוכה - נר שלישי",
  "Chanukah: 4 Candles": "חנוכה - נר רביעי",
  "Chanukah: 5 Candles": "חנוכה - נר חמישי",
  "Chanukah: 6 Candles": "חנוכה - נר שישי",
  "Chanukah: 7 Candles": "חנוכה - נר שביעי",
  "Chanukah: 8 Candles": "חנוכה - נר שמיני",
  "Purim": "פורים",
  "Shushan Purim": "שושן פורים",
  "Lag BaOmer": "ל״ג בעומר",
  "Tisha B'Av": "תשעה באב",
  "Tu BiShvat": "ט״ו בשבט",
  "Yom HaAtzma'ut": "יום העצמאות",
  "Yom HaZikaron": "יום הזיכרון",
  "Yom HaShoah": "יום השואה",
  "Erev Pesach": "ערב פסח",
  "Erev Rosh Hashana": "ערב ראש השנה",
  "Erev Yom Kippur": "ערב יום כיפור",
  "Erev Sukkot": "ערב סוכות",
  "Fast of Esther": "תענית אסתר",
  "Fast of Gedaliah": "צום גדליה",
  "Asara B'Tevet": "עשרה בטבת",
  "Shiva Asar B'Tamuz": "שבעה עשר בתמוז",
  "Yom Yerushalayim": "יום ירושלים",
  "Tu B'Av": "ט״ו באב"
};

// Translate holiday names or fall back gracefully
export function translateHoliday(desc: string): string {
  // If there is an exact translation
  if (holidayTranslations[desc]) {
    return holidayTranslations[desc];
  }
  
  // Handle matches for Chanukah candles
  if (desc.includes("Chanukah") && desc.includes("Candle")) {
    const candlesMatch = desc.match(/\d+/);
    if (candlesMatch) {
      const num = parseInt(candlesMatch[0], 10);
      const ordinalWords = ["", "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שביעי", "שמיני"];
      return `חנוכה - נר ${ordinalWords[num] || num}`;
    }
    return "חנוכה";
  }

  // Handle Rosh Chodesh X
  if (desc.startsWith("Rosh Chodesh ")) {
    const month = desc.replace("Rosh Chodesh ", "");
    const translatedMonth = monthTranslations[month] || month;
    return `ראש חודש ${translatedMonth}`;
  }

  // Handle Chol Hamoed
  if (desc.includes("Chol HaMoed")) {
    if (desc.includes("Pesach")) {
      return "חול המועד פסח";
    }
    if (desc.includes("Sukkot")) {
      return "חול המועד סוכות";
    }
    return "חול המועד";
  }

  return desc;
}

export function getHebrewDateInfo(date: Date): HebrewDateInfo {
  try {
    const hdate = new HDate(date);
    const day = hdate.getDate();
    const monthNameEng = hdate.getMonthName();
    const monthNameHeb = monthTranslations[monthNameEng] || monthNameEng;
    const year = hdate.getFullYear();
    
    const dayHeb = getHebrewNumeral(day);
    const yearHeb = getHebrewYearNumeral(year);
    
    const hebrewDateStr = `${dayHeb} ב${monthNameHeb} ${yearHeb}`;
    const isShabbat = date.getDay() === 6;

    let parasha: string | undefined;
    if (isShabbat) {
      try {
        const sedra = new Sedra(year, true); // True for Israel
        const lookup = sedra.lookup(hdate);
        if (lookup && lookup.parsha && lookup.parsha.length > 0) {
          // Translate parashiot
          const translatedParts = lookup.parsha.map(p => parashaTranslations[p] || p);
          parasha = `פרשת ${translatedParts.join('-')}`;
        }
      } catch (e) {
        console.warn("Failed to lookup sedra:", e);
      }
    }

    // Lookup holiday using HebrewCalendar
    let holiday: string | undefined;
    try {
      const options = {
        start: date,
        end: date,
        israel: true,
        il: true,
        holidays: true,
      };
      const events = HebrewCalendar.calendar(options);
      if (events && events.length > 0) {
        // filter for holidays or major events, ignore parashat hashavua if already fetched
        const holidayEvent = events.find(e => {
          const desc = e.getDesc();
          return desc && !desc.toLowerCase().includes("shabbat") && !desc.toLowerCase().includes("parashat");
        });
        if (holidayEvent) {
          holiday = translateHoliday(holidayEvent.getDesc());
        }
      }
    } catch (e) {
      console.warn("Failed to lookup holiday:", e);
    }

    return {
      gregorianDate: date,
      hebrewDateStr,
      hebrewMonth: monthNameHeb,
      hebrewDayStr: dayHeb,
      hebrewYearStr: yearHeb,
      isShabbat,
      parasha,
      holiday
    };
  } catch (err) {
    console.error("Error creating HebrewDateInfo:", err);
    // Return a graceful fallback if something fails
    return {
      gregorianDate: date,
      hebrewDateStr: "תאריך עברי",
      hebrewMonth: "",
      hebrewDayStr: "",
      hebrewYearStr: "",
      isShabbat: date.getDay() === 6
    };
  }
}

// Get dates for a month
export function getDaysInGregorianMonth(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Format time string to human readable
export function formatTimeHeb(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
}
