import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../../constants'
import axios from 'axios'
import {Container,Row,Col} from 'react-bootstrap'
import { Bar } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
import OrderList from './OrderList'
Chart.register(...registerables)
function AdminOrder() {
    const [totalOrders,setTotalOrders] = useState()
    const [totalSales,setTotalSales] = useState()
    const [users,setTotalUsers]=useState()
    

    const [chartData, setChartData] = useState({
      labels:[],
      datasets:[]
    });
   
    axios.defaults.withCredentials=true;
    useEffect(()=>{
      getTotalOrders()
      getTotalSales()
      getTotalUsers()
      getSalesByDate()
    },[])
    const getTotalOrders= () =>{
      axios.get(`${BASE_URL}/api/orders/total-orders`).then((resp)=>{
        console.log(resp.data);
        setTotalOrders(resp.data.totalOrders
        )
    })
  }

    const getTotalSales= () =>{
      axios.get(`${BASE_URL}/api/orders/total-sales`).then((resp)=>{
        console.log(resp.data);
        setTotalSales(resp.data.totalSales.toFixed(2)
        )
    })
    } 
    const getTotalUsers= () =>{
      axios.get(`${BASE_URL}/api/users/totalusers`).then((resp)=>{
        console.log(resp.data);
        setTotalUsers(resp.data
        )
    })
    } 
    const  getSalesByDate=()=>{
      axios.get(`${BASE_URL}/api/orders/total-sales-by-date`).then((resp)=>{
        console.log(resp.data.salesByDate);
        //setSalesData(resp.data.salesByDate)
        setChartData({labels: resp.data.salesByDate?.map((data) => data?._id), 
          datasets: [
            {
              label: "Sales Trend",
              data: resp.data.salesByDate?.map((data) => data.totalSales),
              backgroundColor: [
                "rgba(75,192,192,1)",
                "#50AF95",
                "#f3ba2f",
                "#2a71d0"
              ],
              borderColor: "black",
              borderWidth: 2
            }
          ]})
    })
  }
  
   

  
  return (
  <>
<div>
<Container >
    <h1 className='text-center'>ADMIN DASHBOARD</h1>
    <Row>
      <Col sm={12}>
      <div className='d-flex justify-content-evenly'>
  <div>
<div className='d-flex justify-content-center align-items-center' style={{backgroundColor:"hotpink",borderRadius:"50% 50%",width:"100px",height:"100px",fontWeight:"bolder"}}> {totalOrders}</div>
<h5>Total Orders</h5>
</div>
  
<div>
<div className='d-flex justify-content-center align-items-center' style={{backgroundColor:"hotpink",borderRadius:"50% 50%",width:"100px",height:"100px",fontWeight:"bolder"}}>&#8377;  {totalSales}</div>
<h5>Total Sales</h5>
</div>
<div>
<div className='d-flex justify-content-center align-items-center' style={{backgroundColor:"hotpink",borderRadius:"50% 50%",width:"100px",height:"100px",fontWeight:"bolder"}}> {users}</div>
<h5>Customers</h5>
</div>
  </div>
      </Col>  
    </Row>
    </Container>
    <Container>
    <Row>
    <Col sm={6} className='mt-5 mx-auto' >
      <Bar style={{height:"50vh"}} data={chartData}  options={{
            title: {
              display: true,
              text: 'Class strength',
              fontSize: 20,
            },
            legend: {
              display: true,
              position: 'right',
            },
          }}/>
      </Col>
    </Row>
    </Container>
    <Container>
    <Row>
      <Col>
      <OrderList/>
      </Col>
    </Row>
  </Container>
</div>
 
  </>
  )
}

export default AdminOrder