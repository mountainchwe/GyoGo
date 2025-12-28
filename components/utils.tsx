import { collection, getDocs, query, where, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export const resetSwipes = async (type: "like" | "bookmark" | "reject") => {
  if (!auth.currentUser) return;

  try {
    const q = query(
      collection(db, "swipes"),
      where("userId", "==", auth.currentUser.uid),
      where("type", "==", type)
    );

    const snap = await getDocs(q);

    const batch = writeBatch(db);

  snap.docs.forEach((docRef) => {
    batch.delete(docRef.ref);
  });

  await batch.commit();
  } catch (e) {
    console.error("Reset failed:", e);
  }
};