const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteEmpresaSubcollections = functions.firestore
  .document("empresas/{empresaId}")
  .onDelete(async (snap, context) => {
    const { empresaId } = context.params;
    const db = admin.firestore();

    // The subcollection is called 'configuracion'
    const subcollectionRef = db.collection(`empresas/${empresaId}/configuracion`);
    const snapshot = await subcollectionRef.get();

    if (snapshot.empty) {
      console.log(`No configuration found for empresa ${empresaId}`);
      return null;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} configuration documents for empresa ${empresaId}`);
    return null;
  });
