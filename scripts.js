const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Modal = {
    open(){
        document.querySelector('.modal-overlay')
            .classList
            .add('active');
    },
    close(){
        document.querySelector('.modal-overlay')
            .classList
            .remove('active');
    }
}

const Transaction = {
    allTransactions: Storage.get(),
    add(transacion){
        Transaction.allTransactions.push(transacion)
        App.reload()
    },
    remove(index){
        Transaction.allTransactions.splice(index, 1)
        App.reload()
    },
    incomes(){
        let incomes = 0
        Transaction.allTransactions.forEach(transacion => {
            if(transacion.amount > 0){
                incomes += transacion.amount
            }
        })
        return incomes
    },
    expenses(){
        let expanses = 0
        Transaction.allTransactions.forEach(transacion => {
            if(transacion.amount < 0){
                expanses += transacion.amount
            }
        })
        return expanses
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer:  document.querySelector("#data-table tbody"),
    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innetHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    innetHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `

        return html;
    },
    updateBalance(){
        document.getElementById('incomesDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expansesDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    },
    formatAmount(amount){
        return Math.round(amount * 100)
    },
    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        const { description, amount, date } = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha os campos")
        }
    },
    formatValues(){
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return{
            description,
            amount,
            date
        }
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event){
        event.preventDefault()
        try{
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch(error){
            alert(error.message)
        }
    }
}

const App = {
    init(){
        Transaction.allTransactions.forEach((transaction, index) => { DOM.addTransaction(transaction, index)})
        DOM.updateBalance()
        Storage.set(Transaction.allTransactions)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
