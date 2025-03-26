import React from 'react'
import "../styles/transaction.css"

const Transaction = () => {
    return (
        <div className="container-transaction">
            <div className="card card-transaction">
                <div className="card-body card-body-transaction">
                    <div className="row">
                        <form className='bg-danger'>
                            <input type="text" className='form-control' />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Transaction