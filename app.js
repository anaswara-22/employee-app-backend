// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Task2: create mongoDB connection 

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
});

const Employee = mongoose.model('Employee', employeeSchema);

mongoose.connect(process.env.MONGO_URI, {
    dbName: 'employeeDB'
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    });


//Task 2 : write api with error handling and appropriate api mentioned in the TODO below







//TODO: get data from db  using api '/api/employeelist'

app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve employees', error: error.message });
    }
});




//TODO: get single data from db  using api '/api/employeelist/:id'

app.get('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve employee', error: error.message });
    }
});





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;

        if (!name || !location || !position || salary === undefined ||
            salary === null || salary === '') {
            return res.status(400).json({ message: 'All employee fields are required' });
        }

        const salaryNumber = Number(salary);

        if (!Number.isFinite(salaryNumber) || salaryNumber < 0) {
            return res.status(400).json({ message: 'Salary must be a non-negative number' });
        }

        const employee = await Employee.create({
            name, location, position, salary: salaryNumber
        });

        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add employee', error: error.message });
    }
});






//TODO: delete a employee data from db by using api '/api/employeelist/:id'

app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully', employee });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete employee', error: error.message });
    }
});





//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

app.put('/api/employeelist', async (req, res) => {
    try {
        const { _id, id, name, location, position, salary } = req.body;
        const employeeId = _id || id;

        if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
            return res.status(400).json({ message: 'A valid employee _id is required in the request body' });
        }

        const salaryNumber = Number(salary);

        if (!name || !location || !position || salary === undefined ||
            salary === null || salary === '' ||
            !Number.isFinite(salaryNumber) || salaryNumber < 0) {
            return res.status(400).json({ message: 'Valid name, location, position and salary are required' });
        }

        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            { name, location, position, salary: salaryNumber },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update employee', error: error.message });
    }
});


//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

const PORT = process.env.PORT || 3000;

mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});



