import Spinner from 'react-bootstrap/Spinner';

function SpinnerComponent() {
  return (
    <div className=' mt-5'>
<Spinner  animation="grow" variant="success">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
    </div>
    
  );
}

export default SpinnerComponent;