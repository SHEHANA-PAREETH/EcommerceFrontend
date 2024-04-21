import React from 'react'
import {Container} from 'react-bootstrap'
function ProgressSteps({step1,step2,step3,step4}) {
  return (
    <Container className='d-flex justify-content-center align-items-center'>
      <div className={`${step1 ? 'bg-success me-2' : 'bg-secondary me-2'}`} style={{ height: '5px', width: '15rem' }}>
        <span>Login</span>
        
        {step1 && <div>✔</div>}
        
      </div>
      
      {step2 && (
        <>
          <div className='me-2'>
            {step1 && (
              <div className={`${step2 ? 'bg-success' : 'bg-secondary'}`} style={{ height: '5px', width: '15rem' }}>
                <span >Paid</span>
                {step2 && <div>✔</div>}
              </div>
            )}
          </div>
        </>
      )}
     
      <div className={`${step3 ? 'text-success me-2' : 'text-secondary me-2'}`}>
        <span className={`${step3 ? 'ms-2' : ''}`}>Shipping</span>
        {step1 && step2 && step3 && <div>✔</div>}
      </div>
      {step4 && (
        <>
          <div className='me-2'>
            <div className={`${step4 ? 'bg-success' : 'bg-secondary'}`} style={{ height: '5px', width: '15rem' }}>
              
              
            </div>
          </div>
          <div className={`${step4 ? 'text-success' : 'text-secondary'}`}>
            <span className='ms-2'>Delivered</span>
            {step4 && <div>✔</div>}
          </div>
        </>
      )}
    </Container>
  )
}

export default ProgressSteps