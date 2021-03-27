import { forwardRef } from 'react'

import AddFile from '../../img/icons/addFile.svg'

const FileUploadRef = ({ display, thisRef }) => {
  return (
    <div
      className={'fileUpload' + (display ? ' yes-opacity' : ' no-opacity')}
      ref={thisRef}
    >
      <div className={'addIcon' + (display ? ' bigger' : ' smaller')}>
        <img src={AddFile} alt="➕"></img>
      </div>
    </div>
  )
}

const FileUpload = forwardRef((props, ref) => (
  <FileUploadRef thisRef={ref} {...props} />
))

export default FileUpload
