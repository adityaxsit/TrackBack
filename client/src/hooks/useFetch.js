import {useEffect,useState} from "react";
function useFetch(url){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  
  useEffect(()=>{
    setLoading(true);
    setError(null);
    fetch(url)
      .then((response)=>{
        if(!response.ok){
          throw new Error("failed to fetch data");
        }
        return response.json();
      })
      .then((data)=>{
        setData(data);
      })
      .catch((error)=>{
        setError(error);  
      })
      .finally(()=>{
        setLoading(false);
      })
    },[url]);
    return{
      data,
      loading,
      error, 
    };
    
  }
  
  export default useFetch;
        
