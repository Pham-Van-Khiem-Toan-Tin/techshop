import { FormProvider, useForm, useWatch, type SubmitHandler } from "react-hook-form"
import type { ProductCreateForm, ProductFormUI, SKU, SkuCreateForm } from "../../types/product.type"
import { data, useNavigate } from "react-router";
import { RiSaveLine } from "react-icons/ri";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { BsBox } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { TbNotes } from "react-icons/tb";
import { GoStack } from "react-icons/go";
import GeneralTabs from "./GeneralTabs";
import DescriptionTabs from "./DescriptionTabs";
import AttributeTabs from "./AttributeTabs";
import SKUTabs from "./SKUTabs";
import { useCreateProductMutation } from "../../features/product/product.api";
import { toast } from "react-toastify";

const ProductCreate = () => {
    const navigate = useNavigate();
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
            skus: []
        },
        shouldUnregister: false
    });
    const {
        handleSubmit,
        control
    } = methods;
    const hasVariants = useWatch({ name: "hasVariants", control })
    const [createProduct, { isLoading }] = useCreateProductMutation()
    const onSubmit: SubmitHandler<ProductFormUI> = async (data: ProductFormUI) => {
        try {
            const hasVariants = data.hasVariants;
            let skus: SkuCreateForm[] = [];
            if (!hasVariants) {
                skus = [{
                    name: data.name,
                    skuCode: data.slug,
                    price: data.price,
                    costPrice: data.costPrice,
                    originalPrice: data.originalPrice,
                    stock: data.stock,
                    attributes: [],
                    image: null
                }]
            } else {
                skus = data.skus.map(item => ({
                    name: item.name,
                    skuCode: item.skuCode,
                    price: item.price,
                    costPrice: item.costPrice,
                    originalPrice: item.originalPrice,
                    stock: item.stock,
                    attributes: item.attributes,
                    image: item.image
                }))
            }
            const payload: ProductCreateForm = {
                name: data.name.trim(),
                slug: data.slug.trim(),
                brandId: data.brandId,
                categoryId: data.category.id,
                specs: data.attributes,
                hasVariants: data.hasVariants,
                description: data.description,
                shortDescription: data.shortDescription.trim(),
                warrantyMonth: data.warrantyMonth,
                attributes: data.skuOptions.filter(at => at.values.length > 0),
                thumbnail: data.image as File,
                gallery: data.gallery as File[],
                skus: skus,
            }
            console.log(payload);

            const fd = new FormData()
            fd.append("name", payload.name)
            fd.append("slug", payload.slug)
            fd.append("brandId", payload.brandId)
            fd.append("categoryId", payload.categoryId)
            fd.append("description", payload.description)
            fd.append("shortDescription", payload.shortDescription)
            fd.append("warrantyMonth", String(payload.warrantyMonth))
            fd.append("hasVariants", String(payload.hasVariants))

            payload.specs.forEach((spec, index) => {
                fd.append(`specs[${index}].id`, spec.id)
                fd.append(`specs[${index}].code`, spec.code)
                fd.append(`specs[${index}].name`, spec.name)
                fd.append(`specs[${index}].value`, spec.value)
                fd.append(`specs[${index}].selected`, JSON.stringify(true))
                fd.append(`specs[${index}].label`, spec.label)
                fd.append(`specs[${index}].labelOption`, "test")
                fd.append(`spec[${index}].unit`, spec.unit)
            })
            payload.attributes.forEach((at, index) => {
                fd.append(`attributes[${index}].id`, at.id)
                fd.append(`attributes[${index}].label`, at.name)
                at.values.forEach((a, indexA) => {
                    fd.append(`attributes[${index}].values[${indexA}].k`, a.id)
                    fd.append(`attributes[${index}].values[${indexA}].v`, a.value)
                })
            })
            fd.append("thumbnail", payload.thumbnail)
            payload.gallery.forEach((file) => {
                fd.append("gallery", file)
            })
            payload.skus.forEach((sku, index) => {
                fd.append(`skus[${index}].code`, sku.skuCode);
                fd.append(`skus[${index}].name`, sku.name);
                fd.append(`skus[${index}].price`, String(sku.price));
                fd.append(`skus[${index}].costPrice`, String(sku.costPrice));
                fd.append(`skus[${index}].originalPrice`, String(sku.originalPrice));
                fd.append(`skus[${index}].stock`, String(sku.stock));
                sku.attributes.forEach((op, indexOp) => {
                    fd.append(`skus[${index}].specs[${indexOp}].id`, op.id)
                    fd.append(`skus[${index}].specs[${indexOp}].value`, op.value)
                    fd.append(`skus[${index}].specs[${indexOp}].groupId`, op.groupId)
                })
                if (sku.image) {
                    fd.append(`skus[${index}].image`, sku.image);
                }
            })
            const res = await createProduct(fd).unwrap();
            toast.success(res?.message ?? "Tạo sản phẩm thành công");

            // setTimeout(() => navigate("/categories", { replace: true }), 1200);
        } catch (error: any) {
            toast.error(error?.data?.message ?? "Có lỗi xảy ra");
        }

    }
    return (
        <div className="d-flex align-items-center justify-content-center">
            <div className="border-app--rounded bg-white m-4 py-4" style={{ width: "1000px" }}>
                <div className="d-flex align-items-center justify-content-between border-bottom px-4 pb-4">
                    <div>
                        <div className="fw-bold fs-6">Thêm sản phẩm mới</div>
                        <div className="f-caption">Điền thông tin chi tiết và cấu hình biến thể.</div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn-app btn-app--ghost btn-app--sm"
                            onClick={() => navigate(-1)}
                            // disabled={isCreating}
                            type="button"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            form="product-form"
                            className="btn-app btn-app--sm d-flex align-items-center gap-2"
                        // disabled={isCreating}
                        >
                            <RiSaveLine />
                            Lưu
                            {/* {isCreating ? "Đang lưu..." : "Lưu danh mục"} */}
                        </button>
                    </div>
                </div>
                <FormProvider {...methods} >
                    <form id="product-form" className="form-app pt-4" onSubmit={handleSubmit(onSubmit)}>
                        <fieldset>
                            <Tabs forceRenderTabPanel>
                                <TabList className="px-4 tablist">
                                    <Tab>
                                        <div><BsBox /> <span>Thông tin chung</span></div>
                                    </Tab>
                                    <Tab>
                                        <div><IoSettingsOutline /> <span>Thông số kỹ thuật</span></div>
                                    </Tab>
                                    {
                                        hasVariants && (
                                            <Tab>
                                                <div><GoStack /> <span>Phân loại & Biến thể</span></div>
                                            </Tab>
                                        )
                                    }
                                    <Tab>
                                        <div><TbNotes /> <span>Mô tả</span></div>
                                    </Tab>
                                </TabList>
                                <TabPanel>
                                    <GeneralTabs />
                                </TabPanel>
                                <TabPanel>
                                    <AttributeTabs />
                                </TabPanel>
                                {
                                    hasVariants && (
                                        <TabPanel>
                                            <SKUTabs />
                                        </TabPanel>
                                    )
                                }
                                <TabPanel>
                                    <DescriptionTabs />
                                </TabPanel>
                            </Tabs>
                        </fieldset>
                    </form>
                </FormProvider>
            </div>
        </div>
    )
}

export default ProductCreate