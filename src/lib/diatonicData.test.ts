import { 
  ALL_KEYS, 
  DEGREE_LABELS, 
  DIATONIC_TABLE, 
  getRandomDegree,
  getChordForKeyAndDegree,
  generateDistractors,
  type KeyName 
} from "./diatonicData";

describe("diatonicData", () => {
  test("All 12 keys are present in DIATONIC_TABLE", () => {
    expect(Object.keys(DIATONIC_TABLE)).toHaveLength(12);
    ALL_KEYS.forEach(key => {
      expect(DIATONIC_TABLE[key]).toBeDefined();
    });
  });

  test("Each key has exactly 7 entries", () => {
    ALL_KEYS.forEach(key => {
      expect(DIATONIC_TABLE[key]).toHaveLength(7);
    });
  });

  test("Degrees are I through VII in order", () => {
    ALL_KEYS.forEach(key => {
      const degrees = DIATONIC_TABLE[key].map(entry => entry.degree);
      expect(degrees).toEqual(DEGREE_LABELS);
    });
  });

  test("Known chords spot-check for key of C", () => {
    const cKey = DIATONIC_TABLE.C;
    expect(cKey[0]).toEqual({ degree: "1st", quality: "Major", chord: "C" });
    expect(cKey[1]).toEqual({ degree: "2nd", quality: "minor", chord: "Dm" });
    expect(cKey[4]).toEqual({ degree: "5th", quality: "Major", chord: "G" });
    expect(cKey[6]).toEqual({ degree: "7th", quality: "dim", chord: "Bdim" });
  });

  test("Known chords spot-check for key of D", () => {
    const dKey = DIATONIC_TABLE.D;
    expect(dKey[0]).toEqual({ degree: "1st", quality: "Major", chord: "D" });
    expect(dKey[2]).toEqual({ degree: "3rd", quality: "minor", chord: "F#m" });
    expect(dKey[5]).toEqual({ degree: "6th", quality: "minor", chord: "Bm" });
  });

  test("Known chords spot-check for key of G", () => {
    const gKey = DIATONIC_TABLE.G;
    expect(gKey[0]).toEqual({ degree: "1st", quality: "Major", chord: "G" });
    expect(gKey[3]).toEqual({ degree: "4th", quality: "Major", chord: "C" });
    expect(gKey[4]).toEqual({ degree: "5th", quality: "Major", chord: "D" });
  });

  test("getRandomDegree returns valid degree", () => {
    for (let i = 0; i < 10; i++) {
      const degree = getRandomDegree();
      expect(DEGREE_LABELS).toContain(degree);
    }
  });

  test("getChordForKeyAndDegree returns correct chord", () => {
    const result = getChordForKeyAndDegree("C", "5th");
    expect(result).toEqual({ degree: "5th", quality: "Major", chord: "G" });
    
    const result2 = getChordForKeyAndDegree("A", "2nd");
    expect(result2).toEqual({ degree: "2nd", quality: "minor", chord: "Bm" });
  });

  test("getChordForKeyAndDegree throws for invalid degree", () => {
    expect(() => {
      getChordForKeyAndDegree("C", "VIII" as any);
    }).toThrow();
  });

  test("generateDistractors returns correct number of distractors", () => {
    const distractors = generateDistractors("C", "G", 3);
    expect(distractors).toHaveLength(3);
    expect(distractors).not.toContain("G");
  });

  test("generateDistractors prefers same key chords", () => {
    const distractors = generateDistractors("C", "G", 3);
    const cKeyChords = DIATONIC_TABLE.C.map(e => e.chord).filter(c => c !== "G");
    
    // At least some distractors should be from the same key
    const sameKeyCount = distractors.filter(d => cKeyChords.includes(d)).length;
    expect(sameKeyCount).toBeGreaterThan(0);
  });

  test("All entries have correct quality patterns", () => {
    ALL_KEYS.forEach(key => {
      const entries = DIATONIC_TABLE[key];
      expect(entries[0].quality).toBe("Major");  // I
      expect(entries[1].quality).toBe("minor");  // ii
      expect(entries[2].quality).toBe("minor");  // iii
      expect(entries[3].quality).toBe("Major");  // IV
      expect(entries[4].quality).toBe("Major");  // V
      expect(entries[5].quality).toBe("minor");  // vi
      expect(entries[6].quality).toBe("dim");    // vii°
    });
  });
});