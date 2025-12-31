export async function GET(request, { params }) {
  try {
    const { store } = params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("pid");

    if (!productId || !store) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const doc = await db.collection("products").doc(productId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = doc.data();
    const storeData = product.store?.find(
      (s) => s.name === store
    );

    if (!storeData?.externalUrl) {
      return NextResponse.json({ error: "Store URL missing" }, { status: 404 });
    }

    const response = NextResponse.redirect(storeData.externalUrl, 302);

    // fire & forget tracking (unchanged)
    trackClick({ request, productId, store });

    return response;
  } catch (e) {
    console.error("OUT ERROR", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
  }
