import { FormProvider, useForm, type SubmitHandler } from "react-hook-form"
import type { ProductFormUI } from "../../types/product.type"
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

const ProductCreate = () => {
    const navigate = useNavigate();
    const methods = useForm<ProductFormUI>({
        defaultValues: {
            name: "",
            slug: "",
            shortDescription: "",
            description: "",
            skuOptions: [],
            skus: []
        }
    });
    const {
        handleSubmit
    } = methods;
    const onSubmit: SubmitHandler<ProductFormUI> = (data: ProductFormUI) => {

    }
    return (
        <div className="d-flex align-items-center justify-content-center">
            <div className="border-app--rounded bg-white m-4 py-4" style={{width: "1000px"}}>
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
                                    <Tab>
                                        <div><GoStack /> <span>Phân loại & Biến thể</span></div>
                                    </Tab>
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
                                <TabPanel>
                                    <SKUTabs />
                                </TabPanel>
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