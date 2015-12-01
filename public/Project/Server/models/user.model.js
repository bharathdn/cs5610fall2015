module.exports = function(app, db, mongoose, passport){

    var q  = require("q");
    //var flow = require("finally");
    var breUserSchema = require("./schemas/user.schema.js")(mongoose);
    var breUserModel = mongoose.model("breUserModel",breUserSchema);

    var breUserFriendsSchema = require("./schemas/user.friends.schema")(mongoose);
    var breUserFriendsModel = mongoose.model("breUserFriendsSchema",breUserFriendsSchema);



    var api = {
        CreateNewUser                   : CreateNewUser,
        FindAll                         : FindAll,
        FindById                        : FindById,
        findUserByUsername              : findUserByUsername,
        Update                          : Update,
        Delete                          : Delete,
        findUserByCredentials           : findUserByCredentials,

        //userFriends Functions
        AddFriendForUserId              : AddFriendForUserId,
        findFriendsAndFollowersForId    : findFriendsAndFollowersForId,
        RemoveFriendorFollower          : RemoveFriendorFollower
        //FollowUserById          : FollowUserById
    };
    return api;


    /*
            userId      :  String,
            friends     : [String],
            followers   : [String]

    */

    function RemoveFriendorFollower(userId, friendId){
        var deferred = q.defer();
        breUserFriendsModel.findOne({userId: userId},
            function( err, user){
                if(err){
                    deferred.reject(err);
                }else{
                    user.friends.splice(user.friends.indexOf(friendId),1);
                    user.save(function(err, friends){
                        if(err){
                            deferred.reject(err);
                        }else{
                            // remove userId from friend's Obj
                            breUserFriendsModel.findOne({userId: friendId},
                            function(err, friendUser){
                                if(err){
                                    deferred.reject(err);
                                }else{
                                    // remove userId from friendUser's followers
                                    friendUser.followers.splice(friendUser.followers.indexOf(userId),1);
                                    friendUser.save(function(err, result){
                                        if(err){
                                            deferred.reject(err);
                                        }else{
                                            deferred.resolve(result);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        return deferred.promise;
    }


    function findFriendsAndFollowersForId(userId) {
        var deferred = q.defer();

        var finalRes = {};
        breUserFriendsModel.findOne({userId: userId},
            function (err, user) {

                //console.log(user);

                //console.log(user.friends);
                //console.log(user.followers);


                breUserModel.find({$or: [ {_id : {$in: user.friends}} ]},
                    function(err, friends){
                        if(err){
                            deferred.reject(err);
                        }
                        else {
                            //deferred.resolve(users);
                            finalRes.friends = friends;
                            breUserModel.find({$or: [{_id: {$in: user.followers}}]},
                                function(err, followers){
                                    if(err){
                                        deferred.reject(err);
                                    }
                                    else{
                                        finalRes.followers = followers;
                                        deferred.resolve(finalRes);
                                    }
                                });
                        }
                });
            });
        return deferred.promise;
    }


    function AddFriendForUserId(userId, friendId){
        console.log("SERVER USER MODEL: Adding user"+friendId+" as friend to "+userId);
        //return "Hello";
        //  x adds y as friend

        var deferred = q.defer();
        // add y to x's friend list
        breUserFriendsModel.findOne({userId: userId},
            function(err,result){
                breUserFriendsModel.findOne({userId: userId},
                   function(err, userObj){
                       userObj.friends.push(friendId);
                       userObj.save(function(err,result){
                           console.log(result);
                       });
                   });
                 breUserFriendsModel.findOne({userId: friendId},
                   function(err, userObj){
                       console.log("user's friend has followers, updating now");
                       userObj.followers.push(userId);
                       userObj.save(function(err,result){
                           //TODO, resolve both user obj and user friend obj to verify
                           deferred.resolve(result);
                       });
                   });
        });
        return deferred.promise;
    }

    // User Friend Functions above |^|

    function CreateNewUser(user){
        //console.log(user);
        var deferred = q.defer();
        var finalResult={};
        breUserModel.create(user, function(err, result){
            if(err){
                deferred.reject(err);
            } else {
                //TODO, resolve both user obj and user friend obj to verify
                finalResult.user = result;
                breUserFriendsModel.create({userId: result._id, friends: [], followers: []},
                function(err, friendResult){
                    console.log(friendResult);
                    finalResult.friend = friendResult;
                    deferred.resolve(finalResult);
                });
            }
        });
        return deferred.promise;
    }


    function findUserByCredentials(credentials){
        var deferred = q.defer();
        var username = credentials.username;
        var password = credentials.password;
        breUserModel.findOne({username: username, password: password},
        function(err,result){
           if(err){
               deferred.reject(err);
           } else {
               //console.log(result);
               deferred.resolve(result);
           }
        });

        return deferred.promise;
    }


    function FindAll(){
        console.log("findall called");
        var deferred = q.defer();
        breUserModel.find(function(err,result){
                if(err){
                    deferred.reject(null);
                } else {
                    deferred.resolve(result);
                }
            });
        return deferred.promise;
    }


    function findUserByUsername(username){
        var deferred = q.defer();
        //console.log("brebreUserModel sent user");
        //console.log(username);
        breUserModel.findOne({username: username},
            function(err,result){
                if(err){
                    deferred.reject(null);
                } else {
                    deferred.resolve(result);
                }
            });
        return deferred.promise;
    }


    function FindById(id){
        var deferred = q.defer();
        //console.log("USER MODEL: findbyID called "+ id);
        breUserModel.findById(id,
            function(err,result){
                if(err){
                    deferred.reject(err);
                } else {
                    deferred.resolve(result);
                }
            });
        return deferred.promise;
    }


    function Delete(userId){
        var deferred = q.defer();
        breUserModel.remove({_id:userId},
            function(err,result){
                if(err){
                    deferred.reject(null);
                } else {
                    //console.log(result);
                    deferred.resolve(result);
                }
            });
        return deferred.promise;
    }


    function Update(userId, user){
        var deferred = q.defer();

        delete user._id;
        breUserModel.update({_id: userId}, {$set: user},
            function(err,result){
                if(err){
                    deferred.resolve(err);
                }else{
                    deferred.resolve(result);
                }
            });
        return deferred.promise;
    }


}