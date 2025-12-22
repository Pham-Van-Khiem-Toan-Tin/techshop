import { Accordion } from "react-bootstrap"
import "../../styles/components/_accordion.scss"
const AccordionSelect = () => {
  return (
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className="d-flex align-items-center justify-content-between form-app">
            <div className="d-flex align-items-center">
              <label className="cb me-2">
                <input
                  type="checkbox"
                // checked={checked}
                // disabled={disabled}
                // onChange={() => selection!.onToggleRow(id)}
                />
                <span className="cb__box" />
              </label>
              <span className="f-bold text-black f-body d-inline-block">Quản lí người dùng</span>
            </div>
            {/* <div>
              <span>0/4</span>

            </div> */}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>
          <div className="d-flex align-items-center justify-content-between form-app">
            <div className="d-flex align-items-center">
              <label className="cb me-2">
                <input
                  type="checkbox"
                // checked={checked}
                // disabled={disabled}
                // onChange={() => selection!.onToggleRow(id)}
                />
                <span className="cb__box" />
              </label>
              <span className="f-bold text-black f-body d-inline-block">Quản lí người dùng</span>
            </div>

          </div>
        </Accordion.Header>
        <Accordion.Body>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

export default AccordionSelect