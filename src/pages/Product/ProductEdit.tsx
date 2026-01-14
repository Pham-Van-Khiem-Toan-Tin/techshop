import { useEffect } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { RiSaveLine } from "react-icons/ri";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { BsBox } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { TbNotes } from "react-icons/tb";
import { GoStack } from "react-icons/go";
import { toast } from "react-toastify";

// Import các components tabs
import GeneralTabs from "./GeneralTabs";
import DescriptionTabs from "./DescriptionTabs";
import AttributeTabs from "./AttributeTabs";
import SKUTabs from "./SKUTabs";

// Import types và api
import type { ProductFormUI, ProductCreateForm, Attribute, Image, DataType } from "../../types/product.type";
import { useGetProductByIdQuery, useUpdateProductMutation } from "../../features/product/product.api";
import { useLazyGetCategoryByIdQuery } from "../../features/category/category.api";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // API Hooks
  const { data: productData, isLoading: isFetching } = useGetProductByIdQuery(id ?? "", { skip: !id });
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [getCategoryDetail] = useLazyGetCategoryByIdQuery();

  const methods = useForm<ProductFormUI>({
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      hasVariants: false,
      price: 0,
      originalPrice: 0,
      costPrice: 0,
      stock: 0,
      skuOptions: [],
      skus: [],
      gallery: [],
      image: null,
      attributeOptions: [] // Quan trọng để render tab Thông số kỹ thuật
    },
  });

  const { handleSubmit, reset, watch, setValue } = methods;
  const hasVariants = watch("hasVariants");
  const toImageUrl = (img?: string | Image | null): string | null => {
    if (!img) return null;
    if (typeof img === "string") return img;
    return img.url ?? null;
  };
  const toGalleryUrls = (gallery?: Array<string | Image> | null): string[] => {
    if (!gallery) return [];
    return gallery
      .map(toImageUrl)
      .filter((x): x is string => Boolean(x));
  };
  // 1. Load dữ liệu và map vào Form
  useEffect(() => {
    if (productData) {
      const loadInitData = async () => {
        try {
          // Lấy thông tin Category để fill Attribute Options (cấu hình thông số)
          const catRes = await getCategoryDetail(productData.category.id).unwrap();

          // Map Attribute Options (Định nghĩa trường dữ liệu)
          const mappedAttributeOptions = (catRes.attributeConfigs ?? []).map(item => ({
            id: item.id,
            code: item.code,
            label: item.label,
            isRequired: item.isRequired,
            isFilterable: item.isFilterable,
            displayOrder: item.displayOrder,
            unit: item.unit,
            dataType: item.dataType as DataType, // Cần hàm convert nếu type không khớp string
            options: (item.optionsValue ?? []).map(ot => ({ id: ot.id, value: ot.id, label: ot.label })),
          }));

          // Map SKU Options (Nhóm biến thể: Màu sắc, Size...)
          // Logic này giả định backend trả về structure Group[] trong productData.attributes (theo interface bạn gửi)
          // Nếu backend không trả về group định nghĩa, bạn phải tự reduce từ list SKUs.

          // Map SKUs
          const mappedSkus = productData.skus.map(sku => ({
            ...sku,
            key: sku.skuCode, // Dùng skuCode làm key tạm
            id: sku.id,
            skuCode: sku.skuCode,
            image: sku.thumbnail.imageUrl, // URL ảnh (string)
            name: sku.name,
            price: sku.price,
            costPrice: sku.costPrice,
            originalPrice: sku.originalPrice,
            active: sku.active,
            discontinued: sku.discontinued,
            stock: sku.stock,
            attributes: sku.selections
          }));
          console.log(productData);
          
          // Reset form
          reset({
            name: productData.name,
            slug: productData.slug,
            brandId: productData.brand.id,
            category: {
              id: productData.category.id,
              name: productData.category.name,
            },
            warrantyMonth: productData.warrantyMonth,
            shortDescription: productData.shortDescription,
            description: productData.description,
            hasVariants: productData.hasVariants,
            // Nếu có biến thể, giá ở ngoài thường là min price hoặc 0, tùy logic
            skuOptions: productData.variantGroups.map(it => ({
              id: it.id,
              name: it.label,
              value: "",
              values: it.values.map(v => ({
                groupId: it.id,
                value: v.value,
                id: v.id,
                active: v.active,
                isOldData: true
              })),
            })),
            image: productData.thumbnail.imageUrl, // URL string
            gallery: productData.gallery.map(it => it.imageUrl), // URL strings array

            attributes: productData.specs.map(it => ({
              id: it.id,
              code: it.code,
              label: it.label,
              dataType: it.dataType,
              unit: it.unit,
              value: it.value,
              displayOrder: it.displayOrder
            })), // Giá trị thông số kỹ thuật
            attributeOptions: mappedAttributeOptions, // Cấu hình thông số
            bulk: {price: 0, costPrice: 0, originalPrice: 0, stock: 0},
            skus: mappedSkus, // Danh sách biến thể chi tiết

          });

        } catch (error) {
          console.log(error);
          
          toast.error("Lỗi khi tải dữ liệu sản phẩm");
        }
      };
      loadInitData();
    }
  }, [productData, reset, getCategoryDetail]);

  // 2. Xử lý Submit (Tương tự Create nhưng logic FormData khác một chút với File/String)
  const onSubmit: SubmitHandler<ProductFormUI> = async (data) => {
    if (!id) return;
    try {
      const fd = new FormData();

      // Các trường cơ bản
      fd.append("name", data.name.trim());
      fd.append("slug", data.slug.trim());
      fd.append("brandId", data.brandId);
      fd.append("categoryId", data.category.id);
      fd.append("description", data.description);
      fd.append("shortDescription", data.shortDescription);
      fd.append("warrantyMonth", String(data.warrantyMonth));
      fd.append("hasVariants", String(data.hasVariants));

      // Specs (JSON)
      // Cần hàm prepareSpecs giống ProductCreate
      const specsToSend = data.attributes.map(attr => ({
        id: attr.id,
        value: attr.value // Backend tự xử lý type dựa trên metadata
      }));
      fd.append("specs", JSON.stringify(specsToSend));

      // Attributes (Sku Options definition)
      data.skuOptions.forEach((at, index) => {
        fd.append(`attributes[${index}].groupId`, at.id);
        fd.append(`attributes[${index}].label`, at.name);
        at.values.forEach((a, indexA) => {
          fd.append(`attributes[${index}].values[${indexA}].id`, a.id);
          fd.append(`attributes[${index}].values[${indexA}].value`, a.value);
        });
      });

      // Thumbnail: Chỉ gửi nếu là File mới
      if (data.image instanceof File) {
        fd.append("thumbnail", data.image);
      }

      // Gallery: Chỉ gửi File mới, URL cũ backend tự giữ (hoặc logic xóa ảnh cũ tùy API)
      if (data.gallery && data.gallery.length > 0) {
        data.gallery.forEach((item) => {
          if (item instanceof File) {
            // 1. Nếu là File (ảnh mới upload) -> Thêm vào newGalleryImages
            fd.append("newGalleryImages", item);
          } else if (typeof item === 'object' && 'imagePublicId' in item) {
            // 2. Nếu là Object Image cũ -> Lấy PublicId thêm vào keptGalleryImageIds
            // Backend sẽ dựa vào thứ tự list này để sắp xếp
            fd.append("keptGalleryImageIds", item.imagePublicId);
          }
        });
      }

      // SKUs
      // Lưu ý: Logic update SKU thường phức tạp (thêm/sửa/xóa). 
      // Ở đây giả định gửi đè toàn bộ hoặc backend handle theo skuCode/id.
      if (!data.hasVariants) {
        // Logic Simple Product
        fd.append("price", String(data.price));
        fd.append("stock", String(data.stock));
        // ... các trường khác
      } else {
        data.skus.forEach((sku, index) => {
          fd.append(`skus[${index}].code`, sku.skuCode);
          fd.append(`skus[${index}].name`, sku.name);
          fd.append(`skus[${index}].price`, String(sku.price));
          fd.append(`skus[${index}].stock`, String(sku.stock));
          // ... các trường khác

          // Specs của SKU
          sku.attributes.forEach((op, indexOp) => {
            fd.append(`skus[${index}].specs[${indexOp}].id`, String(op.id));
            fd.append(`skus[${index}].specs[${indexOp}].value`, String(op.value));
            fd.append(`skus[${index}].specs[${indexOp}].groupId`, String(op.groupId));
          });

          // Ảnh SKU: Chỉ gửi nếu là File
          if (sku.image instanceof File) {
            fd.append(`skus[${index}].image`, sku.image);
          }
        });
      }

      await updateProduct({ id, data: fd }).unwrap();
      toast.success("Cập nhật sản phẩm thành công");
      navigate("/products");

    } catch (error: any) {
      toast.error(error?.data?.message ?? "Lỗi cập nhật sản phẩm");
    }
  };

  if (isFetching) return <div className="text-center p-5">Đang tải dữ liệu...</div>;

  return (
    <div className="d-flex align-items-center justify-content-center">
      <div className="border-app--rounded bg-white m-4 py-4" style={{ width: "1000px" }}>
        <div className="d-flex align-items-center justify-content-between border-bottom px-4 pb-4">
          <div>
            <div className="fw-bold fs-6">Cập nhật sản phẩm</div>
            <div className="f-caption">Chỉnh sửa thông tin chi tiết của sản phẩm.</div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn-app btn-app--ghost btn-app--sm"
              onClick={() => navigate(-1)}
              type="button"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="product-edit-form"
              className="btn-app btn-app--sm d-flex align-items-center gap-2"
              disabled={isUpdating}
            >
              <RiSaveLine />
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <FormProvider {...methods}>
          <form id="product-edit-form" className="form-app pt-4" onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isUpdating}>
              <Tabs forceRenderTabPanel>
                <TabList className="px-4 tablist">
                  <Tab><div><BsBox /> <span>Thông tin chung</span></div></Tab>
                  <Tab><div><IoSettingsOutline /> <span>Thông số kỹ thuật</span></div></Tab>
                  {hasVariants && (
                    <Tab><div><GoStack /> <span>Phân loại & Biến thể</span></div></Tab>
                  )}
                  <Tab><div><TbNotes /> <span>Mô tả</span></div></Tab>
                </TabList>

                <TabPanel><GeneralTabs /></TabPanel>
                <TabPanel><AttributeTabs /></TabPanel>
                {hasVariants && (
                  <TabPanel><SKUTabs mode="edit" /></TabPanel>
                )}
                <TabPanel><DescriptionTabs /></TabPanel>
              </Tabs>
            </fieldset>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default ProductEdit;