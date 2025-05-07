export const isValidProduct = (product: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof product?.title !== "string" || product.title.trim().length === 0) {
    errors.push("Title is required and must be a non-empty string.");
  }

  if (typeof product?.description !== "string" || product.description.trim().length === 0) {
    errors.push("Description is required and must be a non-empty string.");
  }

  if (typeof product?.price !== "number" || product.price <= 0) {
    errors.push("Price must be a positive number.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

