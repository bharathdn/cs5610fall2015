module.exports = function(app) {
    var mockForms = require("./form.mock.json");
    var api = {
        Create: Create,
        FindAll: FindAll,
        FindById: FindById,
        Update: Update,
        Delete: Delete,
        findFormByTitle: findFormByTitle,

        FindFormsByUserId: FindFormsByUserId,
        FindFormByFormId: FindFormByFormId,

        GetAllFieldsByFormId: GetAllFieldsByFormId,
        DeleteFieldByIds: DeleteFieldByIds

    }
    return api;

    function Create(form) {
        form.fields = [];
        mockForms.push(form);
        return mockForms;
    }

    function FindAll() {

    }

    function FindById(id) {

    }

    function Update(id,form) {

    }

    function DeleteFieldByIds(formId,fieldId){
        console.log("calling delete on "+formId+" "+fieldId);
        for(formIndex in mockForms){

            if(mockForms[formIndex].id == formId)
            {
                formFields = mockForms[formIndex].fields;

                for(fieldIndex in formFields){

                    if(formFields[fieldIndex].id == fieldId){
                        mockForms[formIndex].fields.splice(fieldIndex,1);
                        //return mockForms;
                        return mockForms[formIndex].fields;
                    }
                }
            }
        }
        return null;
    }

    function Delete(formId) {
        for(formIndex in mockForms){
            if(mockForms[formIndex].id == formId){
                mockForms.splice(formIndex,1);
            }
        }
        return mockForms;
    }

    function findFormByTitle(title){

    }

    function FindFormByFormId(){

    }

    function GetAllFieldsByFormId(formId){
        for(formIndex in mockForms){
            if(mockForms[formIndex].id == formId){
                return mockForms[formIndex].fields;
            }
        }

    }

    function FindFormsByUserId(userId)
    {
        var userForms = [];
        for(formIndex in mockForms){
            if(mockForms[formIndex].userId == userId){
                userForms.push(mockForms[formIndex]);
            }
        }
        return userForms;
    }
}