var mongoose = require('mongoose');

var BarSchema = new mongoose.Schema({
    barId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    attending: {
        type: [String],
        trim: true
    }
});

var Bar = mongoose.model('Bar', BarSchema);

module.exports = Bar;
